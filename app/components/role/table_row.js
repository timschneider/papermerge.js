import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

class TableRowComponent extends Component {
  @action
  async onRemove(role) {
    await role.destroyRecord();
  }
}

export default TableRowComponent;
