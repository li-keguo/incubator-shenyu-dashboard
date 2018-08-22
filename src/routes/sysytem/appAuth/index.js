import React, { Component } from 'react';
import { Table, Row, Col, Input, Button } from 'antd';
import { connect } from 'dva';
import AddModal from './AddModal';

@connect(({ auth, loading }) => ({
  auth,
  loading: loading.effects['auth/fetchUsers'],
}))
export default class AppAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      selectedRowKeys: [],
      userName: '',
      popup: '',
    };
  }

  componentWillMount() {
    const { currentPage } = this.state;
    this.getAllUsers(currentPage);
  }

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  getAllUsers = (page) => {
    const { dispatch } = this.props;
    const { userName } = this.state;
    dispatch({
      type: 'auth/fetchUsers',
      payload: {
        userName,
        currentPage: page,
        pageSize: 10,
      },
    });
  }

  pageOnchange = page => {
    this.setState({ currentPage: page });
    this.getAllUsers(page);
  };

  closeModal = () => {
    this.setState({ popup: '' });
  }

  editClick = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'auth/fetchItem',
      payload: {
        id: record.id,
      },
      callback: (user) => {
        this.setState({
          popup: <AddModal
            {...user}
            handleOk={(values) => {
              const { userName, password, role, enabled, id } = values;
              dispatch({
                type: 'auth/update',
                payload: {
                  userName,
                  password,
                  role,
                  enabled,
                  id,
                },
                callback: () => {
                  this.closeModal();
                },
              });

            }}
            handleCancel={() => {
              this.closeModal();
            }}
          />,
        })
      },
    });
  };

  searchOnchange = e => {
    const userName = e.target.value;
    this.setState({ userName });
  };

  searchClick = () => {
    this.getAllUsers(1);
  };

  deleteClick = () => {
    const { dispatch } = this.props;
    const { userName, currentPage, selectedRowKeys } = this.state;
    dispatch({
      type: 'auth/delete',
      payload: {
        userName,
        currentPage,
        pageSize: 10,
        list: selectedRowKeys,
      },
    });
  }

  addClick = () => {
    this.setState({
      popup: <AddModal
        handleOk={(values) => {
          const { dispatch } = this.props;
          const { userName, password, role, enabled } = values;
          dispatch({
            type: 'auth/add',
            payload: {
              userName,
              password,
              role,
              enabled,
            },
            callback: () => {
              this.closeModal();
            },
          });
        }}
        handleCancel={() => {
          this.closeModal();
        }}
      />,
    })
  }

  render() {
    const { auth, loading } = this.props;
    const { userList } = auth;
    const { currentPage, selectedRowKeys, userName, popup } = this.state;
    const userColumns = [
      {
        title: '用户名',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (text) => {
          if (text) {
            return <div>开启</div>
          } else {
            return <div>关闭</div>
          }
        },
      },
      {
        title: '创建时间',
        dataIndex: 'dateCreated',
        key: 'dateCreated',
      },
      {
        title: '更新时间',
        dataIndex: 'dateUpdated',
        key: 'dateUpdated',
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record) => {
          return (
            <div
              className="edit"
              onClick={() => {
                this.editClick(record);
              }}
            >
              编辑
            </div>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div>
        <Row type="flex" justify="flex-start" align="middle" gutter={20}>
          <Col span={8} className="searchblock">
            <Input
              value={userName}
              onChange={this.searchOnchange}
              placeholder="请输入用户名"
            />
            <Button type="primary" onClick={this.searchClick}>
              查询
            </Button>
          </Col>
          <Col span={4}>
            <Button
              type="danger"
              onClick={this.deleteClick}
            >
              删除勾选数据
            </Button>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              onClick={this.addClick}
            >
              添加数据
            </Button>
          </Col>
        </Row>
        <Table
          size='small'
          style={{ marginTop: 30 }}
          bordered
          loading={loading}
          columns={userColumns}
          dataSource={userList}
          rowSelection={rowSelection}
          pagination={{
            total: 3,
            current: currentPage,
            pageSize: 10,
            onChange: this.pageOnchange,
          }}
        />
        {popup}
      </div>
    );
  }
}
