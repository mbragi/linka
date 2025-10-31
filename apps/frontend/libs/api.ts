const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'
}

const getRootUrl = () => {
  return process.env.NEXT_PUBLIC_ROOT_URL ?? 'http://localhost:3000'
}

export { getBackendUrl, getRootUrl }

