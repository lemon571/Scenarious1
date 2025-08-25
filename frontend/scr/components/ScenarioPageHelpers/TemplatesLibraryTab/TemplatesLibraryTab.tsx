import { Flex, Loader, Select, Text } from '@gravity-ui/uikit';
import styles from '../../../pages/Scenario/Scenario.module.css';
import localStyles from './TemplatesLibraryTab.module.css';
import BlockTemplate from '../../BlockTemplate/BlockTemplate';
import pluralize from '../../../utils/pluralize';
import { useMemo, useState } from 'react';
import { getRoleDisplayName, scenarioFullRoles } from '../../../utils/roleMapping';
import { useBlockTemplates } from '../../../hooks/useTemplates';
import ErrorWrapper from '../../ErrorWrapper/ErrorWrapper';

export default function TemplatesLibraryTab() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: blockTemplates, isLoading, isError, error } = useBlockTemplates();

  const filteredTemplates = useMemo(() => {
    if (!blockTemplates) return [];

    return blockTemplates.filter(temp => {
      if (selectedRoles.length) {
        const hasRole = temp.roles.some(role => selectedRoles.includes(role));
        if (!hasRole) return false;
      }

      return true;
    });
  }, [blockTemplates, selectedRoles]);

  const getErrorMessage = (e: unknown) =>
    e instanceof Error ? e.message : 'Ошибка при загрузке шаблонов';

  return (
    <div className={localStyles.templatesLibrary}>
      <Flex width="100%" justifyContent="space-between">
        <Flex gap={4} alignItems="center">
          <Text variant="header-1">Шаблоны</Text>
          <Text variant="body-1" color="secondary">
            ( {blockTemplates?.length || 0}{' '}
            {pluralize(blockTemplates?.length || 0, 'штука', 'штуки', 'штук')} )
          </Text>
        </Flex>
        <Select
          placeholder="Фильтровать по ролям"
          value={selectedRoles}
          onUpdate={values => {
            const newValues = (values as string[]) || [];
            const newRoles = newValues.filter(v => scenarioFullRoles.includes(v));
            setSelectedRoles(newRoles);
          }}
          size="l"
          width={300}
          multiple
          view="normal"
          popupPlacement="bottom-end"
        >
          {scenarioFullRoles.map(role => (
            <Select.Option key={role} value={role}>
              {getRoleDisplayName(role)}
            </Select.Option>
          ))}
        </Select>
      </Flex>

      <main className={styles.mainContent}>
        {isLoading && (
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{ width: '100%', height: '100%', padding: '3rem' }}
          >
            <Loader size="l" />
          </Flex>
        )}
        {isError && (
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{ width: '100%', height: 'fit-content', padding: '3rem' }}
          >
            <ErrorWrapper title="Не удалось загрузить шаблоны" text={getErrorMessage(error)} />
          </Flex>
        )}
        {!isLoading && !isError && (
          <div className={styles.templatesGrid}>
            {filteredTemplates.map(template => (
              <BlockTemplate key={template.id} template={template} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
