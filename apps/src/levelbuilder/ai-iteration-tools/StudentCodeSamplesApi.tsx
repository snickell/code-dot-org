import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

export async function fetchStudentCodeSamples(
  numSamples: number,
  scriptId: number,
  levelId: number
): Promise<string | null> {
  console.log('Fetching student code samples');
  try {
    const response = await fetch(
      `/student_code_samples/${numSamples}/${scriptId}/${levelId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      }
    );
    console.log('response', response);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student code samples:', error);
    return null;
  }
}
