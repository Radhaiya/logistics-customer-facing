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
  IconPlus,
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

type DocumentFileRow = {
  id: string
  file: File | null
}

function createDocumentFileRow(): DocumentFileRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file: null,
  }
}

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
  const [fileRows, setFileRows] = useState<DocumentFileRow[]>(() => [createDocumentFileRow()])
  const [expiryDate, setExpiryDate] = useState('')
  const selectedFiles = fileRows.map((row) => row.file).filter((file): file is File => Boolean(file))

  const addFileRow = () => setFileRows((rows) => [...rows, createDocumentFileRow()])

  const updateFileRow = (id: string, file: File | null) => {
    setFileRows((rows) => rows.map((row) => (row.id === id ? { ...row, file } : row)))
  }

  const removeFileRow = (id: string) => {
    setFileRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== id)))
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) return

    try {
      await uploadDocument.mutateAsync({
        vehicleId,
        documentType,
        documentName: documentName.trim() || undefined,
        files: selectedFiles,
        expiryDate: expiryDate || undefined,
        scope,
      })
      setFileRows([createDocumentFileRow()])
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
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleUpload}
                loading={uploadDocument.isPending}
                disabled={!selectedFiles.length}
              >
                Upload
              </Button>
            </Group>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  Files
                </Text>
                <Tooltip label="Add another file">
                  <ActionIcon
                    variant="light"
                    color="cyan"
                    onClick={addFileRow}
                    aria-label="Add another file"
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              {fileRows.map((row, index) => (
                <Group key={row.id} gap="xs" align="flex-end" wrap="nowrap">
                  <FileInput
                    placeholder={index === 0 ? 'PDF or image' : 'Additional PDF or image'}
                    value={row.file}
                    onChange={(file) => updateFileRow(row.id, file)}
                    accept="image/*,.pdf"
                    flex={1}
                    aria-label={`Document file ${index + 1}`}
                  />
                  <Tooltip label="Remove file">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => removeFileRow(row.id)}
                      disabled={fileRows.length === 1}
                      aria-label={`Remove document file ${index + 1}`}
                    >
                      <IconTrash size={17} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ))}
            </Stack>
            {!selectedFiles.length && (
              <Alert color="gray" variant="light" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm">Select at least one PDF or image before uploading.</Text>
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
