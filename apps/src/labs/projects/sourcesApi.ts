/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {Source, SourceResponse, SourceUpdateOptions} from '../types';
import {SOURCE_FILE} from '../constants';
import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';
import {SourceResponseValidator} from './ResponseValidators';
import {stringifyQueryParams} from '@cdo/apps/utils';

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  channelId: string
): Promise<GetResponse<SourceResponse>> {
  return HttpClient.fetchJson<SourceResponse>(
    rootUrl(channelId),
    {},
    SourceResponseValidator
  );
}

export async function update(
  channelId: string,
  source: Source,
  options?: SourceUpdateOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify({source: JSON.stringify(source)}),
  });
}
