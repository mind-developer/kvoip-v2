import { DocumentViewer } from '@/activities/files/components/DocumentViewer';

export default function DocumentPreview({
  documentUrl,
}: {
  documentUrl: string;
}) {
  return <DocumentViewer documentName="Document" documentUrl={documentUrl} />;
}
