import 'antd/dist/antd.css';
import {BrowserRouter, Routes, Route, Navigate,} from "react-router-dom";
import withUserLayout from "./user/UserLayout";
import withAdminLayout from "./admin/AdminLayout";
import Admin from "./admin";
import User from "./user";
import './App.css';

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<User.Register/>} />
                <Route path="/login" element={<User.Login/>} />

                <Route path="/" element={withUserLayout(<User.JobList/>)} />
                <Route path="/my/jobs" element={withUserLayout(<User.MyJobs/>, true)} />
                <Route path="/my/account" element={withUserLayout(<User.Account/>, true)} />
                <Route path="/job/:id/apply" element={withUserLayout(<User.ApplyJob/>, true)} />
                <Route path="/application/:id/interview" element={withUserLayout(<User.Interview/>, true)} />

                <Route path="/admin" element={<Navigate replace to="/admin/jobs" />} />
                <Route path="/admin/login" element={<Admin.Login/>} />
                <Route path="/admin/jobs" element={withAdminLayout(<Admin.JobList/>)} />
                <Route path="/admin/applications" element={withAdminLayout(<Admin.JobApplications/>)} />
                <Route path="/admin/applications/:id" element={withAdminLayout(<Admin.JobApplicationDetails/>)} />
                <Route path="/admin/applications/:id/interview" element={withAdminLayout(<Admin.Interview/>)} />
                <Route path="/admin/interview" element={withAdminLayout(<Admin.Interviews/>)} />
                <Route path="/admin/my/account" element={withAdminLayout(<Admin.MyAccount/>)} />

                <Route path="/admin/add/accounts" element={withAdminLayout(<Admin.AccountAdd/>)}/>
                <Route path="/admin/accounts" element={withAdminLayout(<Admin.AccountList/>)}/>
                <Route path="/admin/accounts/view" element={withAdminLayout(<Admin.AccountView/>)}/>
               

            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
