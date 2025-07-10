import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Button, Descriptions, Card, Tag, Avatar } from 'antd';
import { HeartTwoTone, LeftOutlined, EyeOutlined, CommentOutlined, StarOutlined, ShareAltOutlined } from '@ant-design/icons';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsInfo, setNewsInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 定义返回函数
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`/news/${id}?_expand=category`)
      .then((res) => {
        const data = res.data;
        setNewsInfo({ ...data, view: data.view + 1 });
        return data;
      })
      .then(res => {
        // 异步更新浏览量，不阻塞UI渲染
        axios.patch(`/news/${id}`, { view: res.view + 1 }).catch(err => {
          console.error('更新浏览量失败:', err);
        });
      })
      .catch(err => {
        console.error('获取新闻详情失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleStar = () => {
    if (newsInfo && !newsInfo.isStarLoading) {
      setNewsInfo(prev => ({
        ...prev,
        isStarLoading: true,
        star: prev.star + 1
      }));

      axios.patch(`/news/${id}`, { star: newsInfo.star + 1 })
        .then(res => {
          setNewsInfo(prev => ({
            ...prev,
            star: res.data.star,
            isStarLoading: false
          }));
        })
        .catch(err => {
          console.error('点赞失败:', err);
          setNewsInfo(prev => ({
            ...prev,
            star: prev.star - 1,
            isStarLoading: false
          }));
        });
    }
  };

  const newsTags = newsInfo?.tags?.split(',').filter(tag => tag.trim());

   return (
    // 完全移除顶部内边距和左侧对齐限制
    <div className="max-w-4xl px-4">
      {/* 返回按钮 */}
      <Button
        type="primary"
        icon={<LeftOutlined />}
        onClick={handleGoBack}
        className="mb-4 hover:bg-primary/90 transition-all"
      >
        返回
      </Button>

      {/* 加载状态 */}
      {loading && (
        <Card loading className="mb-4">
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </Card>
      )}

      {/* 新闻内容 */}
      {newsInfo && !loading && (
        <Card className="mb-4 rounded-xl shadow-md overflow-hidden transform hover:shadow-lg transition-all duration-300 w-full">
          {/* 标题区域 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-[clamp(1.3rem,3vw,2.2rem)] font-bold text-gray-800 leading-tight">
                {newsInfo.title}
              </h1>
              <div className="flex items-center gap-3">
                <Tag color={newsInfo.category?.color || 'blue'}>
                  {newsInfo.category?.title || '未知分类'}
                </Tag>
                <HeartTwoTone
                  twoToneColor="#eb2f96"
                  onClick={handleStar}
                  className={`cursor-pointer ${newsInfo.isStarLoading ? 'animate-pulse' : ''}`}
                />
                <span className="text-gray-600">{newsInfo.star || 0}</span>
              </div>
            </div>

            {/* 标签区域 */}
            {newsTags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newsTags.map((tag, index) => (
                  <Tag key={index} color="geekblue">
                    {tag.trim()}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* 新闻元信息 */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <Descriptions
              column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
              className="text-sm"
              items={[
                {
                  key: '1',
                  label: '作者',
                  children: (
                    <span className="flex items-center">
                      <Avatar size={24} className="mr-2" src={newsInfo.authorAvatar || 'https://picsum.photos/24/24'} />
                      {newsInfo.author}
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: '发布时间',
                  children: moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss'),
                },
                {
                  key: '3',
                  label: '区域',
                  children: newsInfo.region || '全国',
                },
                {
                  key: '4',
                  label: '浏览量',
                  children: (
                    <span className="flex items-center">
                      <EyeOutlined className="mr-1" />
                      {newsInfo.view || 0}
                    </span>
                  ),
                },
                {
                  key: '5',
                  label: '点赞数',
                  children: (
                    <span className="flex items-center">
                      <StarOutlined className="mr-1 text-red-400" />
                      {newsInfo.star || 0}
                    </span>
                  ),
                },
                {
                  key: '6',
                  label: '评论数',
                  children: (
                    <span className="flex items-center">
                      <CommentOutlined className="mr-1" />
                      {newsInfo.commentCount || 0}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* 新闻内容 */}
          <div className="p-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: newsInfo.content }}
            />
          </div>

          {/* 分享区域 */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              分享至: <ShareAltOutlined className="ml-2 cursor-pointer" />
            </div>
            <Button
              type="primary"
              icon={<CommentOutlined />}
              className="hover:bg-primary/90 transition-all"
            >
              查看评论
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}