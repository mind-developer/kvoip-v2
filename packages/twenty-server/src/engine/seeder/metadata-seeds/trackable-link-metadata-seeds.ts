import { FieldMetadataTextSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { FieldMetadataType } from 'twenty-shared';

export const TRACKABLE_LINK_METADATA_SEEDS: ObjectMetadataSeed = {
  labelPlural: 'Trackable links', // Nome plural para exibição
  labelSingular: 'Trackable link', // Nome singular para exibição
  namePlural: 'trackableLinks', // Nome plural para uso interno
  nameSingular: 'trackableLink', // Nome singular para uso interno
  icon: 'IconLink', // Ícone associado à entidade
  fields: [
    {
      type: FieldMetadataType.TEXT,
      label: 'Link Name', // Rótulo do campo
      name: 'linkName', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Website URL', // Rótulo do campo
      name: 'websiteUrl', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Generated URL', // Rótulo do campo
      name: 'generatedUrl', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Campaign Name', // Rótulo do campo
      name: 'campaignName', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Campaign Source', // Rótulo do campo
      name: 'campaignSource', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Means of Communication', // Rótulo do campo
      name: 'meansOfCommunication', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Keyword', // Rótulo do campo
      name: 'keyword', // Nome do campo
      isCustom: false, // Indica se o campo é personalizado
      isNullable: true, // Permite valores nulos
      settings: {
        displayedMaxRows: 1, // Número máximo de linhas exibidas (para campos de texto)
      } as FieldMetadataTextSettings,
    },
  ],
};
