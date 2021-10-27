import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FolderRoute extends Route {
  @service store;

  async model(params) {
    let response, adapter;

    adapter = this.store.adapterFor('node');

    return adapter.findNode(params.node_id);
  }
}