import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { matchSorter } from 'match-sorter';

const Home = ({ photos, currentPage, totalPages, rowsPerPage }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const { query } = router;
    const rows = parseInt(query.rows);

    if (rows && [10, 20, 50, 100].includes(rows)) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, rows },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query]);

  const handleRowsPerPageChange = (event) => {
    const rows = parseInt(event.target.value);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, rows },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPhotos = searchTerm
    ? matchSorter(photos, searchTerm, { keys: ['title'] })
    : photos;

  const displayedPhotos = filteredPhotos.slice(0, rowsPerPage);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Photos</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="search">Search: </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginRight: '1rem' }}
          />
        </div>
        <div>
          Rows per Page:{' '}
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {displayedPhotos.map((photo) => (
          <li key={photo.id} style={{ listStyleType: 'none', textAlign: 'center' }}>
            <img src={photo.thumbnailUrl} alt={photo.title} />
            <p>{photo.title}</p>
          </li>
        ))}
      </ul>
      {!searchTerm && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          {currentPage > 1 && (
            <Link href={`/page/${currentPage - 1}`} passHref>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Previous Page</span>
            </Link>
          )}
          <span>Current Page: {currentPage}</span>
          {currentPage < totalPages && (
            <Link href={`/page/${currentPage + 1}`} passHref>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Next Page</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps({ query, params }) {
  const page = query.page || params.page || '1';
  const response = await fetch('https://jsonplaceholder.typicode.com/photos');
  const photos = await response.json();

  const currentPage = parseInt(page);
  const rowsPerPage = parseInt(query.rows) || 10;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const currentPagePhotos = photos.slice(startIdx, endIdx);

  return {
    props: {
      photos: currentPagePhotos || [],
      currentPage,
      totalPages: Math.ceil(photos.length / rowsPerPage),
      rowsPerPage,
    },
  };
}

export default Home;
