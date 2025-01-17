import Service from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { service } from '@ember/service';
import {
  insert_blob,
  extract_file_name
} from 'papermerge/utils';
import { get_id } from 'papermerge/utils/array';

import { base_url } from 'papermerge/utils/host';


export default class Requests extends Service {
  @service session;
  @service store;

  async runOCR({doc_id, lang}) {
    /*
      Request sent with ContentType: application/json
    */
    let url, headers_copy = {};

    url = `${base_url()}/ocr/`;

    Object.assign(headers_copy, this.headers);  // create a copy of `this.headers`
    headers_copy['Content-Type'] = 'application/json';
    headers_copy['Accept'] = 'application/json';

    return fetch(url, {
      method: 'POST',
      headers: headers_copy,
      body: JSON.stringify({doc_id, lang})
    });
  }

  async deletePages(page_ids) {
    return this._delete('/pages/', {'pages': page_ids});
  }

  async rotatePages({page_ids, angle}) {
    let pages = [];

    pages = page_ids.map(page_id => {
      return {id: page_id, angle: angle};
    });
    return this._post('/pages/rotate/', {'pages': pages});
  }

  async reorderPagesApply({old_items, new_items}) {
    let order_data = [];

    old_items.forEach((item, old_index) => {
      let new_index;

      new_index = new_items.findIndex(it => get_id(it) == get_id(item));
      order_data.push({
        id: get_id(item),
        old_number: old_index + 1,
        new_number: new_index + 1
      })
    });

    return this._post('/pages/reorder/', {'pages': order_data});
  }

  async moveToDocument({dst, pages, position}) {
    return this._post('/pages/move-to-document/', {dst, pages, position});
  }

  async moveToFolder({dst, page_ids, single_page}) {
    return this._post('/pages/move-to-folder/', {
      dst: dst.id,
      pages: page_ids,
      single_page: single_page
    });
  }


  async downloadDocumentVersion(document_version) {
    /**
    *  `document_version` contains following attributes:
    *    id
    *    number
    *    file_name
    *    lang
    *    pages
    *    size
    *    page_count
    *    short_description
    *
    *  attributes which correspond to server side (or client side) DocumentVersion model
    */
    let response, blob;

    response = await this._get(`/document-versions/${document_version.id}/download/`);

    blob = await response.blob();

    insert_blob(
      document_version.file_name,
      blob
    );
  }

  async downloadNodes(selected_nodes) {
    let params_arr,
      params_str,
      response,
      blob,
      file_name;

    params_arr = selected_nodes.map(node => `node_ids=${node.id}`);
    params_str = params_arr.join('&');

    response = await this._get('/nodes/download/', params_str);

    file_name = extract_file_name(response, 'fallback.zip');
    blob = await response.blob();

    insert_blob(file_name, blob);
  }

  async nodesMove(data) {
    let url, headers_copy = {};

    url = `${base_url()}/nodes/move/`;

    Object.assign(headers_copy, this.headers);  // create a copy of `this.headers`
    headers_copy['Content-Type'] = 'application/json';

    return fetch(url, {
      method: 'POST',
      headers: headers_copy,
      body: JSON.stringify(data)
    });
  }

  async search(query) {
    return this._get('/search/', `q=${query}`);
  }

  async preferences({section_name}={}) {
    let params = {};

    if (section_name) {
      params = {'section': section_name};
    }

    return this._get(
      '/preferences/',
      new URLSearchParams(params).toString()
    );
  }

  async preferencesUpdate(data) {
    let url,
      headers_copy = {},
      response,
      that = this;

    url = `${base_url()}/preferences/bulk/`;

    Object.assign(headers_copy, this.headers);  // create a copy of `this.headers`
    headers_copy['Content-Type'] = 'application/json';

    response = fetch(url, {
      method: 'POST',
      headers: headers_copy,
      body: JSON.stringify(data)
    });

    response.then(response => response.json()).then(
      list_of_attrs => {
        list_of_attrs.data.map(item => {
          that.store.push({data: {
            id: item.id,
            type: "preferences",
            attributes: {
              name: item.name,
              value: item.value,
              section: item.section,
              identifier: item.identifier
            }
          }});
        });
    });
  }

  async getInboxCount() {
    return this._get('/nodes/inboxcount/').then(
      response => response.json()
    ).then( data => {
      return data.data.count;
    });
  }

  async _post(url, data) {
    return this._generic({
      method: 'POST',
      url: url,
      data: data,
      content_type: 'application/json'
    });
  }

  async _delete(url, data) {
    return this._generic({
      method: 'DELETE',
      url: url,
      data: data,
      content_type: 'application/json'
    });
  }

  async _generic({method, url, data, content_type}) {
    let url_with_base,
      body_data = '',
      headers_copy = {};

    url_with_base = `${base_url()}${url}`;

    Object.assign(headers_copy, this.headers);
    headers_copy['Content-Type'] = content_type;

    if (data) {
      body_data = JSON.stringify(data);
    }

    return fetch(url_with_base, {
      method: method,
      headers: headers_copy,
      body: body_data,
    });
  }

  async _get(url, params_str) {
    let url_with_base,
      headers_copy = {};

    if (params_str) {
     url_with_base = `${base_url()}${url}?${params_str}`;
    } else {
      url_with_base = `${base_url()}${url}`;
    }
    Object.assign(headers_copy, this.headers);

    return fetch(url_with_base, {
      method: 'GET',
      headers: headers_copy,
    });
  }

  @computed('session.{data.authenticated.token,isAuthenticated}')
  get headers() {
    let _headers = {},
      token;

    if (this.session.isAuthenticated) {
      token = this.session.data.authenticated.token;
      _headers['Authorization'] = `Token ${token}`;
    }

    return _headers;
  }

}
