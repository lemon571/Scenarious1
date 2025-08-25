import type { useEditor } from '@tiptap/react';
import { Button, Card, Icon, Tooltip } from '@gravity-ui/uikit';
import classes from './EditorToolbar.module.css';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  ListOl,
  ListUl,
  CommentPlus,
  Ellipsis,
} from '@gravity-ui/icons';

type ToolbarPosition = {
  x: number;
  y: number;
  visible: boolean;
};
type Props = {
  editor: ReturnType<typeof useEditor>;
  position: ToolbarPosition;
  setPosition: (position: ToolbarPosition) => void;
  onAddComment: (linePosition: number) => void;
};

const BUTTON_SIZE = 'l';

export default function EditorToolbar({ editor, position, setPosition, onAddComment }: Props) {
  const onComment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor) return;

    const pos = editor.state.selection.from;
    onAddComment(pos);

    // if (pos) {
    //     console.log(pos);
    //     const domAtPos = editor.view.domAtPos(pos);
    //     console.log(domAtPos.node);
    //     const text = prompt('Введите комментарий к этой строке:')
    //     if (text) {
    //       setComments((prev) => [
    //         ...prev,
    //         { id: Math.random().toString(36).slice(2), pos, text },
    //       ])
    //     }
    // }
  };

  const onExpand = () => {};

  if (!editor) {
    return null;
  }

  return (
    <Card
      className={classes.container}
      style={{
        top: position.y,
        left: position.x,
      }}
      onClick={() => setPosition({ ...position, visible: false })}
    >
      <Tooltip content="Жирный текст">
        <Button
          view={editor.isActive('bold') ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Icon data={Bold} className={'icon'} />
        </Button>
      </Tooltip>
      <Tooltip content="Курсив">
        <Button
          view={editor.isActive('italic') ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Icon data={Italic} />
        </Button>
      </Tooltip>
      <Tooltip content="Подчеркнутый">
        <Button
          view={editor.isActive('underline') ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Icon data={Underline} />
        </Button>
      </Tooltip>
      <Tooltip content="Заголовок 1">
        <Button
          view={editor.isActive('heading', { level: 1 }) ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Icon data={Heading1} />
        </Button>
      </Tooltip>
      <Tooltip content="Заголовок 2">
        <Button
          view={editor.isActive('heading', { level: 2 }) ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Icon data={Heading2} />
        </Button>
      </Tooltip>
      <Tooltip content="Заголовок 3">
        <Button
          view={editor.isActive('heading', { level: 3 }) ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Icon data={Heading3} />
        </Button>
      </Tooltip>
      <Tooltip content="Нумерация">
        <Button
          view={editor.isActive('orderedList') ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Icon data={ListOl} />
        </Button>
      </Tooltip>
      <Tooltip content="Маркеры">
        <Button
          view={editor.isActive('bulletList') ? 'action' : 'flat'}
          size={BUTTON_SIZE}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon data={ListUl} />
        </Button>
      </Tooltip>
      <Tooltip content="Добавить комментарий">
        <Button view={'flat'} size={BUTTON_SIZE} onClick={onComment}>
          <Icon data={CommentPlus} />
        </Button>
      </Tooltip>
      <div role="separator" aria-orientation="vertical" className={classes.divider} />
      <Tooltip content="Дополнительные функции (пока не работает)">
        <Button view={'flat'} size={BUTTON_SIZE} onClick={onExpand}>
          <Icon data={Ellipsis} />
        </Button>
      </Tooltip>
    </Card>
  );
}
