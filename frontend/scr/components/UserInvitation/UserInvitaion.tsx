import {
  Button,
  Icon,
  Select,
  TextInput,
  Text,
  type SelectProps,
  User,
  Flex,
} from '@gravity-ui/uikit';
import { getRoleDisplayName, scenarioRoles } from '../../utils/roleMapping';

import styles from './UserInvitation.module.css';
import { initialUsers } from '../../mocks/initialUsers';
import { useState } from 'react';
import { Check, Link, Xmark } from '@gravity-ui/icons';
import React from 'react';

export default function UserInvitation() {
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const renderOption: SelectProps['renderOption'] = option => {
    return (
      <React.Fragment>
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <Text variant="body-1">{option.children}</Text>
          <Icon size={20} data={Check} className={`${styles.checkIcon}`} />
        </Flex>
      </React.Fragment>
    );
  };

  return (
    <Flex gap={8} direction="column" className={styles.inviteFrame}>
      <div className={styles.inviteSection}>
        <div className={styles.inviteInput}>
          <TextInput
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Почты пользователей"
            size="xl"
            view="normal"
          />
          <Button size="xl" view="normal">
            Пригласить
          </Button>
          <Button size="xl" onlyIcon={true}>
            <Icon data={Link} size={16} />
          </Button>
        </div>
      </div>

      <div className={styles.accessSection}>
        <div className={styles.accessHeader}>
          <Text variant="subheader-1" color="secondary">
            У кого будет доступ
          </Text>
          <Text variant="body-1" color="secondary">
            {initialUsers.length} человека
          </Text>
        </div>

        <div className={styles.userList}>
          {initialUsers.map(user => {
            return (
              <div key={user.id} className={styles.userItem}>
                <User
                  avatar={{ text: user.name, theme: 'brand' }}
                  name={user.name}
                  description={user.email}
                  size="l"
                />
                <div className={styles.userStatus}>
                  {user.status === 'current' && <Text variant="body-1">{user.role}</Text>}
                  {user.status === 'invited' && (
                    <>
                      <Select
                        renderOption={renderOption}
                        renderPopup={({ renderList }) => {
                          return (
                            <React.Fragment>
                              <div className={styles.customSelectContainer}>
                                <Text variant="subheader-1" color="secondary">
                                  Роль
                                </Text>
                                {renderList()}
                              </div>
                            </React.Fragment>
                          );
                        }}
                        placeholder="Роль"
                        size="l"
                        popupWidth={280}
                        popupPlacement="bottom-end"
                      >
                        {scenarioRoles.map(role => (
                          <Select.Option value={role}>{getRoleDisplayName(role)}</Select.Option>
                        ))}
                      </Select>
                      <Button view="flat-danger" size="m" className={styles.hiddenIcon}>
                        <Icon data={Xmark}></Icon>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Flex>
  );
}
