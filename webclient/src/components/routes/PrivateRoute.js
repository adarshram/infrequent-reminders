import { Navigate } from 'react-router-dom';
import { UserContext } from '../../models/UserContext';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

export default function PrivateRoute(props) {
  const userObject = useContext(UserContext);
  const hasNoProfileInDb = userObject.user && userObject.profile?.email && !userObject.profile.id;
  if (userObject.user === null) {
    return <>Please Wait</>;
  }

  if (userObject.user === false) {
    return <Navigate to="/login" />;
  }

  if (hasNoProfileInDb) {
    console.log(userObject.profile);
    return <Navigate to="/userProfile" />;
  }
  return <Outlet />;
}
