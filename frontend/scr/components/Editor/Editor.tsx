import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as Y from 'yjs';

//@ts-expect-error not installed types
import { WebsocketProvider } from 'y-websocket';

import {Alert, Text} from '@gravity-ui/uikit';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBlockUpdate } from '../../hooks/useBlockUpdate.ts';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback.ts';
import type { Comment } from '../../types';
import CommentNew from '../CommentNew/CommentNew.tsx';
import './Editor.css';
import classes from './Editor.module.css';
import EditorToolbar from './EditorToolbar/EditorToolbar.tsx';
import LinedComments from './LinedComments/LinedComments.tsx';

const WEBSOKET_URL = import.meta.env.VITE_Y_WEBSOCKET_URL;
const PLACEHOLDER_TEXT = 'Ваш текст или важные заметки...';

type Props = {
  username: string;
  userAvatar: string;
  blockDescription: string;
  blockComments: Comment[];
  scenarioId: string;
  blockId: string;
};

function Editor(props: Props) {
  const ydocRoomName = `scenario-${props.scenarioId}-block-${props.blockId}`;
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () => new WebsocketProvider(WEBSOKET_URL, ydocRoomName, ydoc),
    [ydoc, ydocRoomName],
  );

  const [loaded, setLoaded] = useState(false);
  const [wsConnectionHasClosed, setConnectionClosed] = useState(false);

  const { mutate } = useBlockUpdate();
  //@ts-expect-error useDebouncedCallback принимает другие аргументы
  const debauncedMutate = useDebouncedCallback(mutate);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // важно: локально история отключена, т.к. она управляется Yjs
        }),
        Underline,
        Placeholder.configure({
          placeholder: PLACEHOLDER_TEXT,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: props.username,
            color: getUserColor(),
            avatar: props.userAvatar,
          },
          render(user) {
            return renderCursor(user);
          },
        }),
      ],
      content: '',
      onUpdate: ({ editor }) => {
        // const json = editor.getJSON();
        // const text = editor.getText();
        const html = editor.getHTML();
        debauncedMutate({
          blockId: props.blockId,
          scenarioId: props.scenarioId,
          body: { description: html },
        });
      },
    },
    [provider, ydoc, props.userAvatar, props.username],
  );

  useEffect(() => {
    provider.on('status', (value: unknown) => {
      if (value && typeof value === 'object' && 'status' in value)
        console.log('ws status:', value.status);
    });
    provider.on('connection-close', (err: unknown) => {
      console.log('ws closed:', err);
      setConnectionClosed(true);
    });
    provider.on('connection-error', (err: unknown) => {
      console.log('ws error:', err);
      setConnectionClosed(true);
    });
    provider.on('synced', (isSynced: boolean) => {
      if (isSynced) {
        console.log('synced');
        setConnectionClosed(false);
        setLoaded(true);
        const peers = Array.from(provider.awareness.getStates().keys());
        if (peers.length === 1) {
          // first user initialize editor content
          editor?.commands.setContent(props.blockDescription);
        }
      }
    });
    // eslint-disable-next-line
  }, [provider, ydoc, editor]);

  useEffect(() => {
    return () => {
      ydoc?.destroy();
      provider?.disconnect();
    };
  }, [ydoc, provider]);

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const menuEl = menuRef.current;
    const menuWidth = menuEl?.offsetWidth || 0;
    const menuHeight = menuEl?.offsetHeight || 0;

    let x = e.clientX;
    let y = e.clientY + 10;

    // Проверка по горизонтали
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth;
    }

    // Проверка по вертикали
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight;
    }

    setContextMenu({ visible: true, x, y });
  };

  const [commentForm, setCommentForm] = useState<{
    visible: boolean;
    x: number;
    y: number;
    linePosition: number;
  }>({ visible: false, x: 0, y: 0, linePosition: 0 });

  const closeCommentPopup = () => {
    setCommentForm(position => ({ ...position, visible: false }));
  };

  const hideToolbar = () => {
    setContextMenu(position => ({ ...position, visible: false }));
  };

  useEffect(() => {
    //close popups on click outside it
    const closePopups = () => {
      if (!contextMenu.visible) closeCommentPopup();
      hideToolbar();
    };

    window.addEventListener('click', closePopups);
    return () => window.removeEventListener('click', closePopups);
  }, [contextMenu]);

  const handleCommentForm = (linePosition: number) => {
    setCommentForm({ visible: true, x: contextMenu.x, y: contextMenu.y, linePosition });
  };

  if (!loaded) return <Text variant="body-1">Загрузка...</Text>;

  return (
    <div
      className={classes.editorContainer}
      ref={editorContainerRef}
      onContextMenu={handleContextMenu}
    >
      {wsConnectionHasClosed && <Alert theme="danger" title="Проблемы с соединением" message=" Данные могут быть утеряны" className={classes.alertMsg}/>}
      {loaded && <EditorContent editor={editor} />}
      <div className={classes.commentsPanel}>
        {!!props?.blockComments?.length && loaded && (
          <LinedComments
            editor={editor}
            editorContainerRef={editorContainerRef}
            comments={props.blockComments}
          />
        )}
      </div>
      {contextMenu.visible && (
        <div ref={menuRef}>
          <EditorToolbar
            editor={editor}
            position={contextMenu}
            setPosition={setContextMenu}
            onAddComment={handleCommentForm}
          />
        </div>
      )}
      {commentForm.visible && (
        <div
          style={{
            top: commentForm.y,
            left: commentForm.x,
            position: 'fixed',
          }}
          onClick={(evt: React.MouseEvent) => evt.stopPropagation()}
        >
          <CommentNew
            scenarioId={props.scenarioId}
            blockId={props.blockId}
            linePosition={commentForm.linePosition}
            onSuccess={() => closeCommentPopup()}
          />
        </div>
      )}
    </div>
  );
}

function renderCursor(user: Record<string, string>) {
  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  cursor.style.borderLeft = `2px solid ${user.color}`;

  const label = document.createElement('div');
  label.classList.add('cursor-label');
  label.style.backgroundColor = user.color;

  // Добавляем аватар
  const avatar = document.createElement('img');
  avatar.src = user.avatar;
  avatar.style.width = '22px';
  avatar.style.height = '22px';
  avatar.style.borderRadius = '50%';
  avatar.style.marginRight = '4px';

  const name = document.createElement('span');
  name.textContent = user.name;

  label.appendChild(avatar);
  label.appendChild(name);
  cursor.appendChild(label);

  return cursor;
}

function getUserColor() {
  const colors = [
    '--g-color-base-info-medium',
    '--g-color-base-info-medium-hover',
    '--g-color-base-positive-medium',
    '--g-color-base-positive-medium-hover',
    '--g-color-base-warning-medium',
    '--g-color-base-warning-medium-hover',
    '--g-color-base-danger-medium',
    '--g-color-base-danger-medium-hover',
    '--g-color-base-utility-medium',
    '--g-color-base-utility-medium-hover',
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return `var(${colors[randomIndex]})`;
}

export default React.memo(Editor);
