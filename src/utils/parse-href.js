import { parse } from 'url'

export default href => ((typeof href === 'string') ? parse(href, true /* parseQueryString */) : href)
