import { useState, useEffect } from 'react';
//Semantic Search Implementation
const SmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [products] = useState([
      {
        id: 1,
        name: "Personal Loan",
        description: "Unsecured personal loans for various needs",
        rate: "5.99% APR",
        embedding: null  // Will be populated
      },
      {
        id: 2,
        name: "Home Mortgage",
        description: "Fixed and adjustable rate home financing",
        rate: "3.25% APR",
        embedding: null
      },
      {
        id: 3,
        name: "Auto Loan",
        description: "New and used car financing options",
        rate: "4.49% APR",
        embedding: null
      },
      {
        id: 4,
        name: "Credit Card",
        description: "Rewards credit card with cashback",
        rate: "15.99% APR",
        embedding: null
      }
    ]);
  
  const performSemanticSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    console.log(searchQuery)
    try {
      // Generate embeddings for search query
      const queryEmbedding = await generateEmbedding(searchQuery);
      console.log(queryEmbedding)
      // Calculate similarity with product descriptions
      const searchResults = products.map(product => ({
        ...product,
        relevanceScore: calculateSimilarity(queryEmbedding, product.embedding)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // ===================================
  // 1. GENERATE EMBEDDING FOR TEXT
  // ===================================
  
  const generateEmbedding = async (text) => {
    console.log('generate embedding', text)
     try {
    const response = await fetch('https://api.sambanova.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'E5-Mistral-7B-Instruct',
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
     } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  };
  
  // ===================================
  // 2. CALCULATE SIMILARITY BETWEEN EMBEDDINGS
  // ===================================
  // Simplified similarity calculation (cosine similarity)
  const calculateSimilarity = (embedding1, embedding2) => {
    // Implementation would go here
    // For demo purposes, return random similarity
    // Cosine similarity measures how similar two vectors are
    // Result: -1 (opposite) to 1 (identical)
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
    //return Math.random();
  };
  
   // ===================================
  // 3. PRE-COMPUTE PRODUCT EMBEDDINGS
  // ===================================
   const indexProducts =async() => {
    console.log('🔄 Generating embeddings for all products...');
    
    for (const product of products) {
      // Combine name and description for better search
      console.log(product)
      const text = `${product.name} ${product.description}`;
      product.embedding = await generateEmbedding(text);
      
      console.log(`✅ Indexed: ${product.name}`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ All products indexed!');
  }
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSemanticSearch(query);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  useEffect(()=>{
     indexProducts()
  }, [])
  return (
    <div className="smart-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products intelligently..."
      />
      
      <div className="search-results">
        {results.map(product => (
          <div key={product.id} className="result-item">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className="relevance">
              Relevance: {(product.relevanceScore * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartSearch;


/**
 *  // Step 1: Index all products (do this once on app startup)
  await searchSystem.indexProducts();
  
  // Step 2: Search with natural language
  const testQueries = [
    "I need money for a house",           // Should match "Home Mortgage"
    "financing for a new car",            // Should match "Auto Loan"
    "borrow money for vacation",          // Should match "Personal Loan"
    "rewards card with cashback"          // Should match "Credit Card"
  ];
  
  for (const query of testQueries) {
    const results = await searchSystem.search(query);
    searchSystem.displayResults(results);
    
    console.log('----------------------------\n');
  }
 */