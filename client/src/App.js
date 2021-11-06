// 引入react
import React, { Component } from 'react';
// 引入axios
import axios from 'axios';
// 引入antd
import { Button, Input, List, Avatar, Card } from 'antd';
// 引入样式
import './App.css';

class App extends Component {
  state = {
    data: [],
    id: 0,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null,
  };

  // 首先从数据库中获取已有数据
  // 然后添加轮询机制，当数据库中数据变化，重新渲染
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // 在componentwillunmount时销毁定时器
  // 需要及时销毁不需要的进程
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // 在前台使用ID作为数据的key来辨识所需更新或删除的数据
  // 在后台使用ID作为MongoDB中的数据实例的修改依据
  // getDataFromDb函数用于从数据库中获取数据
  getDataFromDb = () => {
    fetch('/api/getData')
      .then((data) => data.json())
      .then((res) => this.setState({ data: res.data }));
  };

  // putDataToDB函数用于调用后台API接口向数据库新增数据
  putDataToDB = (message) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }
    axios.post('/api/putData', {
      id: idToBeAdded,
      message: message,
    });
  };

  // deleteFromDB函数用于调用后台API删除数据库中已经存在的数
  deleteFromDB = (idToDelete) => {
    let objIdToDelete = null;
    this.state.data.forEach((dat) => {
      if (dat.id == idToDelete) {
        objIdToDelete = dat._id;
      }
    });
    axios.delete('/api/deleteData', {
      data: {
        id: objIdToDelete,
      },
    });
  };

  // updateDB 函数用于调用后台API更新数据库中已经存在的数据
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    this.state.data.forEach((dat) => {
      if (dat.id == idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });
    axios.post('/api/updateData', {
      id: objIdToUpdate,
      update: { message: updateToApply },
    });
  };

  // 渲染UI的核心方法
  // 该渲染函数渲染的内容与前台界面展示一致
  render() {
    const { data = [] } = this.state;
    console.log('data', data);
    return (
      <div style={{ width: 990, margin: 20 }}>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/nerd-face_1f913.png" />
                }
                title={<span>{`创建时间: ${item.createdAt}`}</span>}
                description={`${item.id}: ${item.message}`}
              />
            </List.Item>
          )}
        />
        <Card title="新增笔记" style={{ padding: 10, margin: 10 }}>
          <Input
            onChange={(e) => this.setState({ message: e.target.value })}
            placeholder="请输入笔记内容"
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            style={{ margin: 20 }}
            onClick={() => this.putDataToDB(this.state.message)}
          >
            添加
          </Button>
        </Card>
        <Card title="删除笔记" style={{ padding: 10, margin: 10 }}>
          <Input
            style={{ width: '200px' }}
            onChange={(e) => this.setState({ idToDelete: e.target.value })}
            placeholder="填写所需删除的ID"
          />
          <Button
            type="primary"
            style={{ margin: 20 }}
            onClick={() => this.deleteFromDB(this.state.idToDelete)}
          >
            删除
          </Button>
        </Card>
        <Card title="更新笔记" style={{ padding: 10, margin: 10 }}>
          <Input
            style={{ width: 200, marginRight: 10 }}
            placeholder="所需更新的ID"
            onChange={(e) => this.setState({ idToUpdate: e.target.value })}
          />
          <Input
            style={{ width: 200 }}
            onChange={(e) => this.setState({ updateToApply: e.target.value })}
            placeholder="请输入所需更新的内容"
          />
          <Button
            type="primary"
            style={{ margin: 20 }}
            onClick={() =>
              this.updateDB(this.state.idToUpdate, this.state.updateToApply)
            }
          >
            更新
          </Button>
        </Card>
      </div>
    );
  }
}

export default App;
