import { Breadcrumbs } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router-dom';

export type BreadCrumbPathItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

export interface BreadCrumbsPathProps {
  items: BreadCrumbPathItem[];
}

export default function BreadCrumbsPath({ items }: { items: BreadCrumbPathItem[] }) {
  const navigate = useNavigate();
  return (
    <Breadcrumbs style={{ flexBasis: '450px' }} maxItems={10} onAction={id => navigate(String(id))}>
      {items &&
        items.length > 0 &&
        items.map(item => (
          <Breadcrumbs.Item key={item.key} disabled={item.disabled}>
            {item.label}
          </Breadcrumbs.Item>
        ))}
    </Breadcrumbs>
  );
}
