module.exports = (val) => {
  if (val !== undefined && val !== null) {
    var convertedValue
    try {
      convertedValue = decodeURIComponent(val)
    } catch (err) {
      if (err) {
        convertedValue = val
      }
    }
    return convertedValue
  } else {
    return null
  }
}
