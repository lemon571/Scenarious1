import { ChevronRight, TrashBin } from '@gravity-ui/icons';
import { Card, Icon, Label, Text } from '@gravity-ui/uikit';
import classes from './CommentsOfNestedBlocks.module.css';

export default function CommentsOfNestedBlocks() {
  return (
    <>
      <Card className={classes.commentCardContainer}>
        <div className={classes.commentInfo}>
          <Label>Техник</Label>
          <Text>Презентация и звук</Text>
        </div>
        <div className={classes.actionIcons}>
          <Icon data={ChevronRight} className={classes.iconColor} />
          <Icon data={TrashBin} className={classes.iconColor} />
        </div>
      </Card>
      <Card className={classes.commentCardContainer}>
        <div className={classes.commentInfo}>
          <Label>Техник</Label>
          <Text>Презентация и звук</Text>
        </div>
        <div className={classes.actionIcons}>
          <Icon data={ChevronRight} className={classes.iconColor} />
          <Icon data={TrashBin} className={classes.iconColor} />
        </div>
      </Card>
    </>
  );
}
