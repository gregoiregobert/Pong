import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';
import { NoAuthGuard } from './no-auth.guard';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { ChatComponent } from './chat/components/chat/chat.component';
import { CreateRoomComponent } from './chat/components/create-room/create-room.component';

export const routes: Routes = [{
	path:	'',
    redirectTo:    '/landing',
    pathMatch:    'full'
},
{
	path:	'landing',
	title:	'Welcome',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
},
{
	path:	'redirect',
	title:	'Redirect',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./redirect/redirect.component').then(m => m.RedirectComponent),
},
{
	path:	'signup',
	title:	'Sign up',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./signup/signup.component').then(m => m.SignupComponent),
},
{
	path:	'signin',
	title:	'Sign in',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./signin/signin.component').then(m => m.SigninComponent),
},
{
	path:	'edit',
	title:	'Edit',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./edit-page/edit-page.component').then(m => m.EditPageComponent),
},
{
	path:	'twofa',
	title:	'2FA',
	canActivate: [NoAuthGuard],
	loadComponent:    () => import('./twofa/twofa.component').then(m => m.TwofaComponent	),
},
{
	path:    'home',
	title:	'Home',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./home/home.component').then(m => m.HomeComponent),
},
{
	path:    'user',
	title:	'Profile',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./profile/profile.component').then(m => m.ProfileComponent),
},
{
	path:    'user/:id',
	title:	'Profile',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./profile/profile.component').then(m => m.ProfileComponent),
},
{
	path:    'requests',
	title:	'Requests',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./requests/requests.component').then(m => m.RequestsComponent),
},
{
	path:    'profile',
	title:	'Profile',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./private-profile/private-profile.component').then(m => m.PrivateProfileComponent),
},
{
	path:    'achievements',
	title:	'Achievements',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./achievements/achievements.component').then(m => m.AchievementsComponent),
},
{
	path:    'game',
	title:	'Game',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./game/game-board/game-board.component').then(m => m.GameBoardComponent),
},
{
	path:    'chat',
	title:	'chat',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./chat/components/chat/chat.component').then(m => m.ChatComponent),
},
{
	path:    'create-room',
	title:	'Create-Room',
	canActivate: [AuthGuard],
	loadComponent:    () => import('./chat/components/create-room/create-room.component').then(m => m.CreateRoomComponent),
},
{ path: '404', component: NotFoundComponent },
{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
  })
  export class AppRoutingModule {}