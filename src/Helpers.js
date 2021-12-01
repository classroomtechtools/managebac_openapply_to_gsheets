function strip_html_(text) {
  if ((text || '').length===0) return '';
  // ensure it's valid xml by surrounding it in one tag
  text = `<p>${text}</p>`;

  // replace any stray things that sometimes ends up in there
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/<br>/g, '');
  text = text.replace(/&/g, 'and');
  
  // remove email adddresses <me@example.com> because it confuses the parser
  text = text.replace(/<([a-zA-Z.]+@[a-zA-Z.]+)>/g, (match, group) => group);

  // cast to plain text with xml parser
  let xml; 
  try {
    xml = XmlService.parse(note.notes);
  } catch (e) {
    xml = null;
  }
  if (xml !== null)
    return xml.getAllContent().map(item => item.getValue()).join(' ');
  return text;

}

function interpolate_ (baseString, params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  try {
    return new Function(...names, `return \`${baseString}\`;`)(...vals);
  } catch (e) {
    throw new Error(`insufficient parameters. Has ${Object.keys(params)} but ${e.message}`);
  }
}

