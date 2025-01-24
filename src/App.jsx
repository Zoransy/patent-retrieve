import React, { useState } from 'react';
import { Table, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const App = () => {
    const [tableData, setTableData] = useState([]); // 表格数据
    const [processEffect, setProcessEffect] = useState(''); // 工艺效果
    const [loading, setLoading] = useState(false); // 加载状态
    const [isUploaded, setIsUploaded] = useState(false); // 上传状态

    const handleUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true); // 设置加载状态
            setIsUploaded(true); // 设置上传完成
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log(response.data);
            const { process_effect, examples } = response.data.summary; // 假设返回的数据结构
            setProcessEffect(process_effect.join(', ')); // 设置工艺效果
            setTableData(
                examples.map((example, index) => ({
                    ...example,
                    process_effect: index === 0 ? process_effect.join(', ') : null, // 第一行显示工艺效果
                    rowSpan: index === 0 ? examples.length : 0, // 控制行合并
                }))
            );
            message.success('文件处理成功');
        } catch (error) {
            console.error('Error:', error);
            message.error('文件处理失败');
        } finally {
            setLoading(false); // 关闭加载状态
        }
    };

    const columns = [
        {
            title: '沉淀剂种类及浓度',
            dataIndex: 'precipitant',
            key: 'precipitant',
            align: 'center',
        },
        {
            title: '特殊添加剂',
            dataIndex: 'special_additives',
            key: 'special_additives',
            align: 'center',
            render: (text) => (text ? text.join(', ') : '无'),
        },
        {
            title: 'pH 值范围',
            align: 'center',
            children: [
                {
                    title: '造核期',
                    dataIndex: ['ph_values', 'nucleation_period_range'],
                    key: 'ph_nucleation',
                    align: 'center',
                    render: (text) => text || '无',
                },
                {
                    title: '生长期',
                    dataIndex: ['ph_values', 'growth_period_range'],
                    key: 'ph_growth',
                    align: 'center',
                    render: (text) => text || '无',
                },
            ],
        },
        {
            title: '反应温度范围 (℃)',
            align: 'center',
            children: [
                {
                    title: '造核期',
                    dataIndex: ['reaction_temperature', 'nucleation_period_range'],
                    key: 'temperature_nucleation',
                    align: 'center',
                    render: (text) => text || '无',
                },
                {
                    title: '生长期',
                    dataIndex: ['reaction_temperature', 'growth_period_range'],
                    key: 'temperature_growth',
                    align: 'center',
                    render: (text) => text || '无',
                },
            ],
        },
        {
            title: '工艺效果',
            dataIndex: 'process_effect',
            key: 'process_effect',
            align: 'center',
            render: (_, row) => {
                const obj = {
                    children: row.process_effect,
                    props: {},
                };
                if (row.rowSpan) {
                    obj.props.rowSpan = row.rowSpan; // 第一行显示并合并
                } else {
                    obj.props.rowSpan = 0; // 隐藏后续行
                }
                return obj;
            },
        },
        {
            title: '成分', // 父表头
            align: 'center',
            children: [
                {
                    title: '产品化学式',
                    align: 'center',
                    dataIndex: ['composition', 'chemical_formula'],
                    key: 'chemical_formula',
                },
                {
                    title: '掺杂元素',
                    align: 'center',
                    dataIndex: ['composition', 'doped_elements'],
                    key: 'doped_elements',
                    render: (text) => (text ? text.join(', ') : '无'),
                },
            ],
        },
        {
            title: '产品结构',
            align: 'center',
            dataIndex: 'product_structure',
            key: 'product_structure',
        },
        {
            title: '振实密度 (g/cm³)',
            align: 'center',
            dataIndex: 'bulk_density',
            key: 'bulk_density',
        },
        {
            title: '比表面积 (m²/g)',
            align: 'center',
            dataIndex: 'specific_surface_area',
            key: 'specific_surface_area',
        },
        {
            title: 'D50 粒径 (μm)',
            align: 'center',
            dataIndex: 'd50',
            key: 'd50',
        },
    ];

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '98vh',
                backgroundColor: '#f5f5f5',
            }}
        >
            {!isUploaded ? (
                // 上传组件
                <Dragger
                    accept=".pdf"
                    customRequest={handleUpload}
                    showUploadList={false}
                    style={{
                        border: '1px dashed #d9d9d9',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa',
                        padding: '20px',
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">拖动文件到这里上传</p>
                    <p className="ant-upload-hint">支持 .pdf 文件上传，点击或拖动文件到此区域</p>
                </Dragger>
            ) : (
                // 表格组件
                <div style={{ width: '95%', backgroundColor: '#ffffff', borderRadius: '8px' }}>
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        loading={loading}
                        bordered
                        rowKey="key"
                        pagination={false} // 如果需要分页可以修改为 true
                    />
                </div>
            )}
        </div>
    );
};

export default App;
