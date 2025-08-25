import { DateField } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { dateTime } from '@gravity-ui/date-utils';
import { Plus } from '@gravity-ui/icons';
import { Button, Icon, Label, Popover, Text, TextInput, Checkbox } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { getRoleDisplayName, roleMapping, scenarioFullRoles } from '../../utils/roleMapping';
import classes from './BlockDetails.module.css';
import { useAnimationOnChange } from '../../hooks/useAnimationOnChange';

interface BlockDetailsProps {
  color?: string;
  startTime: Date;
  duration: Date;
  roles?: string[];
  location: string;
  updateStartTime: (value: DateTime | null) => void;
  updateLocation: (value: string) => void;
  updateRoles: (roles: string[]) => void;
  updateDuration: (durationMs: number) => void;
}

export default function BlockDetails({
  startTime,
  duration,
  roles,
  location,
  updateStartTime,
  updateLocation,
  updateRoles,
  updateDuration,
}: BlockDetailsProps) {
  const [startTimeValue] = useState<DateTime | null>(dateTime({ input: startTime }));
  const [durationValue, setDurationValue] = useState<DateTime | null>(
    dateTime({ input: duration }),
  );
  const [locationValue, setLocationValue] = useState<string>(location);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(roles || []);

  useEffect(() => {
    setLocationValue(location);
  }, [location]);

  // Normalize incoming roles to internal keys (in case roles come as display names)
  useEffect(() => {
    const displayToKey = Object.fromEntries(
      Object.entries(roleMapping).map(([k, v]) => [v, k]),
    ) as Record<string, string>;
    const normalized = (roles || []).map(r => displayToKey[r] || r);
    setSelectedRoles(normalized);
  }, [roles]);

  const startTimeRef = useAnimationOnChange<typeof startTimeValue, HTMLDivElement>(startTimeValue);

  return (
    <div className={classes.propertyGrid}>
      <div className={classes.propertyRow} ref={startTimeRef}>
        <Text color="secondary">Время начала</Text>
        <DateField
          view="clear"
          format="HH:mm"
          value={startTimeValue}
          onUpdate={(val: DateTime | null) => updateStartTime(val)}
        />
      </div>
      <div className={classes.propertyRow}>
        <Text color="secondary">Продолжительность</Text>
        <DateField
          view="clear"
          format="mm:ss"
          value={durationValue}
          onUpdate={(val: DateTime | null) => {
            setDurationValue(val);
            if (val) {
              const ms = val.valueOf();
              updateDuration(ms);
            }
          }}
        />
      </div>
      {/* <div className={classes.propertyRow}>
        <Text color="secondary">Сегмент</Text>
        <Icon data={Plus} className={classes.iconColor} />
      </div> */}
      <div className={classes.propertyRow}>
        <Text color="secondary">Роли</Text>
        <div className={classes.roleList}>
          <Popover
            open={isOpen}
            onOpenChange={open => {
              setIsOpen(open);
              if (!open) {
                updateRoles(selectedRoles);
              }
            }}
            content={
              <div className={classes.popover}>
                <Text color="secondary" className={classes.popoverTitle}>
                  Выберите одну или несколько ролей
                </Text>
                {scenarioFullRoles.map(roleKey => {
                  const checked = selectedRoles.includes(roleKey);
                  return (
                    <div key={roleKey} className={classes.popoverBodyItem}>
                      <Checkbox
                        checked={checked}
                        onChange={e => {
                          const isChecked = (e.target as HTMLInputElement).checked;
                          setSelectedRoles(prev =>
                            isChecked ? [...prev, roleKey] : prev.filter(r => r !== roleKey),
                          );
                        }}
                      >
                        {getRoleDisplayName(roleKey)}
                      </Checkbox>
                    </div>
                  );
                })}
              </div>
            }
          >
            <Button
              view="flat"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              <Icon data={Plus} className={classes.iconColor} />
            </Button>
          </Popover>
          <div className={classes.labels}>
            {selectedRoles?.map(role => (
              <Label key={role}>{getRoleDisplayName(role)}</Label>
            ))}
          </div>
        </div>
      </div>
      <div className={classes.propertyRow}>
        <Text color="secondary">Место</Text>
        <TextInput
          view="clear"
          placeholder="Введите место"
          value={locationValue}
          onChange={e => setLocationValue(e.target.value)}
          onBlur={() => {
            const next = locationValue.trim();
            if (next && next !== location) updateLocation(next);
          }}
        />
      </div>
      {/* <div className={classes.closeEventDetails}>
            <Icon data={ChevronUp}></Icon>
            <Text>Закрыть</Text>
          </div> */}
    </div>
  );
}
