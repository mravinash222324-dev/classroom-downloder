import { google } from "googleapis"

export function getGoogleClassroom(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.classroom({ version: "v1", auth })
}

export function getGoogleDrive(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: "v3", auth })
}
