import React from 'react';
import { NextPage } from 'next';
import Layout from '../../components/Layout';
import BrewHistory from '../../components/BrewHistory';

const HistoryPage: NextPage = () => {
  return (
    <Layout title="Brew History">
      <BrewHistory />
    </Layout>
  );
};

export default HistoryPage;