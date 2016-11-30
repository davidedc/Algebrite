class DoubleLinkedList
  constructor:  ->
    @headNode = @tailNode = null

  # removes the last element. Since
  # we move used elements to head, the last
  # element is *probably* a relatively
  # unused one.
  remove: (node) ->
    if node.pre
      node.pre.next = node.next
    else
      @headNode = node.next

    if node.next
      node.next.pre = node.pre
    else
      @tailNode = node.pre

  insertBeginning: (node) ->
    if @headNode
      node.next = @headNode
      @headNode.pre = node
      @headNode = node
    else
      @headNode = @tailNode = node

  moveToHead: (node) ->
    @remove node
    @insertBeginning node

  clear: ->
    @headNode = @tailNode = null

class LRUCache
  constructor: (@capacity = 10, @maxAge = 60000) ->
    @_linkList = new DoubleLinkedList()
    @reset()
    @hitCount = @missCount = 0

  resetHitMissCount: ->
    @hitCount = @missCount = 0

  keys: ->
    return Object.keys @_hash

  values: ->
    values = @keys().map (key) =>
      @get key
    return values.filter (v) -> v isnt undefined

  remove: (key) ->
    if @_hash[key]?
      node = @_hash[key]
      @_linkList.remove node
      delete @_hash[key]
      if node.data.onDispose then node.data.onDispose.call this, node.data.key, node.data.value
      @size--

  reset: ->
    @_hash = {}
    @size = 0
    @resetHitMissCount()
    @_linkList.clear()

  set: (key, value, onDispose) ->
    node = @_hash[key]
    if node
      node.data.value = value
      node.data.onDispose = onDispose
      @_refreshNode node
    else
      if @size is @capacity then @remove @_linkList.tailNode.data.key

      createNode = (data, pre, next) -> {data, pre, next}

      node = createNode {key, value, onDispose}
      node.data.lastVisitTime = Date.now()
      @_linkList.insertBeginning node
      @_hash[key] = node
      @size++
      return

  get: (key) ->
    node = @_hash[key]
    if !node
      @missCount++
      return undefined
    if @_isExpiredNode node
      @remove key
      @missCount++
      return undefined
    @_refreshNode node
    @hitCount++
    return node.data.value

  _refreshNode: (node) ->
    node.data.lastVisitTime = Date.now()
    @_linkList.moveToHead node

  _isExpiredNode: (node) ->
    return Date.now() - node.data.lastVisitTime > @maxAge

  has: (key) -> return @_hash[key]?
