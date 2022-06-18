import React,{useState,useEffect} from 'react';

import api from '../../api'
import {Card, Drawer, Table}from 'antd'
import AccountView from './AccountView'
import AccountAdd from './AccountAdd'
function AccountList() {

const [data, setData] = useState([]);
const [drawerAction, setDrawerAction] = useState("");
const [openDrawer, setOpenDrawer] = useState(false);
const [selectRow, setSelectRow] = useState(null);
const [loading, setLoading] = useState(false);
  async function loadData(){
    setLoading(true)
     const res=await api.get('/accounts')
     setData(res.data.data)
     setLoading(false)
  }
useEffect(() => {

    loadData()

}, []);

  const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
  },
    {
    title: 'mobile',
    dataIndex: 'mobile',
    sorter: (a, b) => a.mobile.localeCompare(b.mobile),
  },
  {
  title: 'type',
  dataIndex: 'type',
  sorter: (a, b) => a.type.localeCompare(b.type),
}
  ,
    ,]

    function handleAddNewClick(e){

      e.preventDefault()
      setDrawerAction('add')
      setOpenDrawer(true)

    }
    function handleOnAdded(){
      setOpenDrawer(false)
      loadData()
    }

    function handleOnChanged(){
      setOpenDrawer(false)
      loadData()
    }

    function handleOnEdit() {
      setDrawerAction('edit')
      setOpenDrawer(true)
    }

    function handleRow(record){

      return{
        onClick:()=>{
          setSelectRow(record)
          setDrawerAction("view")
          setOpenDrawer(true)
        }
        
      }
    }

  return (
    <Card title="Accounts" extra={<a href="#" onClick={handleAddNewClick} >Add New</a>}>
    
      <Table 
      dataSource={data}
      columns={columns}
      loading={loading} onRow={handleRow}>
      </Table>

      <Drawer
      mask={false} 
      visible={openDrawer}
      onClose={_ => setOpenDrawer(false)}
>
{ drawerAction === 'add' && <AccountAdd onClose={handleOnAdded}/> }
{ drawerAction === 'edit' && <AccountAdd id={selectRow._id} onClose={handleOnAdded}/> }
      { drawerAction === 'view' && <AccountView id={selectRow._id} onChange={handleOnChanged} onEdit={handleOnEdit}/> }
      
      
      </Drawer>
      </Card>
 
  );
}

export default AccountList;
