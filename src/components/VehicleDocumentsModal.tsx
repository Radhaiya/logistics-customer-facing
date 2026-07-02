import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconDownload,
  IconFileDescription,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import {
  type VehicleDocumentScope,
  useDeleteVehicleDocument,
  useUploadVehicleDocument,
  useVehicleDocuments,
} from '../api/vehicles'
import { EmptyState, ErrorState, LoadingState } from './Feedback'

const documentTypes = ['PUC', 'INSURANCE', 'RC', 'FITNESS', 'PERMIT', 'OTHER']

type VehicleDocumentsModalProps = {
  vehicleId: number
  vehicleLabel: string
  scope?: VehicleDocumentScope
  onClose: () => void
}

export function VehicleDocumentsModal({
  vehicleId,
  vehicleLabel,
  scope = 'tenant-vehicle',
  onClose,
}: VehicleDocumentsModalProps) {
  const { data: documents, isLoading, error, refetch } = useVehicleDocuments(vehicleId, scope)
  const uploadDocument = useUploadVehicleDocument()
  const deleteDocument = useDeleteVehicleDocument()
  const [documentType, setDocumentType] = useState('PUC')
  const [documentName, setDocumentName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [expiryDate, setExpiryDate] = useState('')

  const handleUpload = async () => {
    if (!file) return

    try {
      await uploadDocument.mutateAsync({
        vehicleId,
        documentType,
        documentName: documentName.trim() || undefined,
        file,
        expiryDate: expiryDate || undefined,
        scope,
      })
      setFile(null)
      setDocumentName('')
      setExpiryDate('')
    } catch {
      // Mutation hook owns the notification.
    }
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Documents - ${vehicleLabel}`}
      centered
      size="xl"
      radius="md"
      padding="lg"
    >
      <Stack gap="lg">
        <Paper withBorder radius="md" p="md" className="app-surface">
          <Stack gap="sm">
            <Group gap="xs">
              <IconUpload size={16} />
              <Text size="sm" fw={650}>
                Upload document
              </Text>
            </Group>
            <Group align="flex-end" gap="sm">
              <Select
                label="Type"
                data={documentTypes}
                value={documentType}
                onChange={(value) => setDocumentType(value || 'PUC')}
                w={{ base: '100%', sm: 150 }}
              />
              <TextInput
                label="Name"
                placeholder="Optional"
                value={documentName}
                onChange={(event) => setDocumentName(event.currentTarget.value)}
                w={{ base: '100%', sm: 180 }}
              />
              <TextInput
                label="Expiry"
                type="date"
                value={expiryDate}
                onChange={(event) => setExpiryDate(event.currentTarget.value)}
                w={{ base: '100%', sm: 160 }}
              />
              <FileInput
                label="File"
                placeholder="PDF or image"
                value={file}
                onChange={setFile}
                accept="image/*,.pdf"
                flex={1}
              />
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleUpload}
                loading={uploadDocument.isPending}
                disabled={!file}
              >
                Upload
              </Button>
            </Group>
            {!file && (
              <Alert color="gray" variant="light" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm">Select a PDF or image before uploading.</Text>
              </Alert>
            )}
          </Stack>
        </Paper>

        {isLoading ? (
          <LoadingState label="Loading documents" />
        ) : error ? (
          <ErrorState error={error} title="Documents unavailable" onRetry={() => void refetch()} />
        ) : !documents?.length ? (
          <EmptyState title="No documents" message="Uploaded files will appear here." />
        ) : (
          <Stack gap="sm">
            {documents.map((document) => (
              <Paper key={document.id} withBorder radius="md" p="sm" className="app-surface">
                <Group justify="space-between" gap="md" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Badge variant="light" color="cyan" leftSection={<IconFileDescription size={12} />}>
                      {document.documentType}
                    </Badge>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {document.documentName || document.documentType}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {document.expiryDate ? `Expires ${document.expiryDate}` : 'No expiry date'}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Download">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        component="a"
                        href={document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Download document"
                      >
                        <IconDownload size={17} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() =>
                          deleteDocument.mutate({ vehicleId, documentId: document.id, scope })
                        }
                        loading={deleteDocument.isPending}
                        aria-label="Delete document"
                      >
                        <IconTrash size={17} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  )
}
