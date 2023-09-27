// Common utils shared between legacy and Lab2 Dance

export function computeCharactersReferenced(studentCode: string): string[] {
  // Process studentCode to determine which characters are referenced and create
  // charactersReferencedSet with the results:
  const charactersReferencedSet = new Set<string>();
  const charactersRegExp = new RegExp(
    /^.*make(Anonymous|New)DanceSprite(?:Group)?\([^"]*"([^"]*)[^\r\n]*/,
    'gm'
  );
  let match;
  while ((match = charactersRegExp.exec(studentCode))) {
    const characterName = match[2];
    charactersReferencedSet.add(characterName);
  }
  return Array.from(charactersReferencedSet);
}

// Generate the validation callback from stringified validation code.
// TODO: We're allowing the return type to be a generic 'Function' since the Dance Party
// repo currently doesn't export types. If/when types are available, we can narrow the
// return type.
// eslint-disable-next-line @typescript-eslint/ban-types
export function getValidationCallback(validationCode: string): Function {
  return new Function(
    'World',
    'nativeAPI',
    'sprites',
    'events',
    validationCode
  );
}
