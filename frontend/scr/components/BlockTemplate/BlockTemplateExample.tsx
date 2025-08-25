import BlockTemplate from './BlockTemplate';
import { initialBlockTemplates } from '../../mocks/initialBlockTemplates';
import styles from './BlockTemplate.module.css';

export default function BlockTemplateExample() {
  return (
    <div className={styles.gridContainer}>
      {initialBlockTemplates.map(template => (
        <BlockTemplate key={template.id} template={template} />
      ))}
    </div>
  );
}
