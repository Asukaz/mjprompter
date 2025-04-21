import { Redirect } from 'expo-router';

// Redirect to the style tab when opening the app
export default function Index() {
  return <Redirect href="/style" />;
}