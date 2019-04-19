module.exports = (value) => {
  if (value === 'on' || value === 'true') {
    return true
  } else {
    return false
  }
}
