import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect';
import { RecordIndexContainerContextStoreObjectMetadataEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreObjectMetadataEffect';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHandleIndexIdentifierClick } from '@/object-record/record-index/hooks/useHandleIndexIdentifierClick';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';

export const RecordIndexPage = () => {
  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  if (
    isUndefined(contextStoreCurrentObjectMetadataItemId) ||
    !isNonEmptyString(contextStoreCurrentViewId)
  ) {
    return null;
  }

  return (
    <PageContainer>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{
              instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
            }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{
                instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
              }}
            >
              <PageTitle title={`${capitalize(objectNamePlural)}`} />
              <RecordIndexPageHeader />
              <PageBody>
                <StyledIndexContainer>
                  <RecordIndexContainerContextStoreObjectMetadataEffect />
                  <RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect />
                  <MainContextStoreComponentInstanceIdSetterEffect />
                  <RecordIndexContainer />
                </StyledIndexContainer>
              </PageBody>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </PageContainer>
  );
};
