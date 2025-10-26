import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/const/previewable-extensions.const';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconDownload, IconExternalLink } from '@tabler/icons-react';
import axios from 'axios';
import React from 'react';
import { IconButton } from 'twenty-ui/input';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const MIME_TYPE_MAPPING: Record<
  (typeof PREVIEWABLE_EXTENSIONS)[number],
  string
> = {
  bmp: 'image/bmp',
  csv: 'text/csv',
  odt: 'application/vnd.oasis.opendocument.text',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  htm: 'text/html',
  html: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tiff: 'image/tiff',
  txt: 'text/plain',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  webp: 'image/webp',
};

const StyledDocViewer = styled(DocViewer)`
  overflow: hidden;
  #pdf-controls {
    display: none;
  }
  user-select: none;
  &:hover {
    cursor: initial;
  }
  overflow: 'hidden';
  z-index: 1;
  position: 'inherit';
  border: none;
  border-radius: 12px;
`;

function DocumentMessage({
  documentUrl,
  fromMe,
}: {
  documentUrl: string;
  fromMe: boolean;
}) {
  const theme = useTheme();
  const fileName = documentUrl.slice(
    documentUrl.lastIndexOf('/') + 1,
    documentUrl.length,
  );
  const { extension } = getFileNameAndExtension(fileName);
  const extensionParsed = extension.toLowerCase().replace('.', '');
  const mimeType = PREVIEWABLE_EXTENSIONS.includes(
    extension.toLowerCase().replace('.', ''),
  )
    ? MIME_TYPE_MAPPING[extensionParsed]
    : undefined;

  if (mimeType)
    return (
      <StyledDocViewer
        documents={[
          {
            uri: documentUrl,
            fileName: fileName,
            fileType: mimeType,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            // disableHeader: true,
            disableFileName: true,
            retainURLParams: false,
            overrideComponent: (currentDocument) => (
              <Header fromMe={fromMe} currentDocument={currentDocument} />
            ),
          },
          pdfVerticalScrollByDefault: true,
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.1,
          },
        }}
        style={{
          width: 290,
          height: 180,
          // borderRadius: 12,
        }}
      />
    );
  return (
    <p style={{ margin: 0, color: theme.font.color.primary }}>
      Could not load document preview.
      <br />
      <br />
      <br />
    </p>
  );
}

export default React.memo(DocumentMessage);

const StyledHeaderContainer = styled.div<{ fromMe: boolean }>`
  width: 100%;
  display: flex;
  gap: 10;
  align-items: center;
  justify-content: space-between;
  bottom: 0;
  padding: 5px 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
  background: ${({ fromMe, theme }) =>
    fromMe
      ? theme.name === 'dark'
        ? '#274238'
        : '#D9FDD3'
      : theme.background.quaternary} !important;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledFileName = styled.p`
  margin: 0;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function Header({
  currentDocument,
  fromMe,
}: {
  currentDocument: any;
  fromMe: boolean;
}) {
  const { fileName } = currentDocument.documents[0];
  return (
    <StyledHeaderContainer fromMe={fromMe}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* <AttachmentIcon attachmentType="Other" /> */}
        <StyledFileName>
          {JSON.stringify(currentDocument.documents[0].fileName).replaceAll(
            '"',
            '',
          )}
        </StyledFileName>
      </div>
      <div style={{ display: 'flex' }}>
        <IconButton
          variant="tertiary"
          Icon={IconDownload}
          onClick={() => {
            const link = document.createElement('a');
            axios
              .get(currentDocument.documents[0].uri, {
                responseType: 'blob',
              })
              .then((d) => {
                link.href = URL.createObjectURL(d.data);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              });
          }}
        />
        <IconButton
          onClick={() => window.open(currentDocument.documents[0].uri)}
          variant="tertiary"
          Icon={IconExternalLink}
        />
      </div>
    </StyledHeaderContainer>
  );
}
