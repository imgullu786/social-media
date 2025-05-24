import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/SignUpPage'
import LoginPage from './pages/auth/LoginPage'
import SideBar from './components/common/Sidebar'
import BottomBar from './components/common/Bottombar'
import SuggestionPanel from './components/common/SuggestionPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ExplorePage from './pages/explore/ExplorePage'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import {useQuery} from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'
import MessagePage from './pages/chat/MessagePage'
function App() {
	const location = useLocation();

	const {data:authUser, isLoading} = useQuery({
		queryKey: ['authUser'],
		queryFn: async() => {
			try {
				const response = await fetch('/api/auth/me');
				const data = await response.json();
				if(data.error) return null;
				if(!response.ok) throw new Error(data.error || 'Something went wrong');
				console.log(data);
				return data;
			} catch (error) {
				console.log(error);
				throw new Error(error);
			}
		},
		retry: false,
	});
	if(isLoading) {
		return (
		<div className='flex justify-center items-center h-screen'>
			<LoadingSpinner size='lg'/>
		</div>
		);
	};
  return (
    <div className='flex max-w-6xl mx-auto'>
		{authUser && <SideBar/>}
		{authUser && <BottomBar/>}
		<Routes>
			<Route path='/' element={authUser? <HomePage/> : <Navigate to='/login'/> }/>
			<Route path='/signup' element={!authUser? <SignUpPage />: <Navigate to='/'/>} />
			<Route path='/login' element={!authUser? <LoginPage />: <Navigate to='/'/> } />
			<Route path='/notifications' element={authUser? <NotificationPage/> : <Navigate to='/login'/>} />
			<Route path='/messages' element={authUser? <MessagePage/> : <Navigate to='/login'/>} />
			<Route path='/explore' element={authUser? <ExplorePage/> : <Navigate to='/login'/>} />
			<Route path='/profile/:username' element={authUser? <ProfilePage/> : <Navigate to='/login'/>} />
			<Route path='*' element={<h1>Not Found</h1>} />
		</Routes>
		{authUser && location.pathname !== '/messages' && <SuggestionPanel/>}
		<Toaster/>
	</div>
  )
}

export default App
