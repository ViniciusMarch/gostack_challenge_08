import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const itemsInCart = await AsyncStorage.getItem('@gomarketplace:products');

      if (itemsInCart) {
        setProducts(JSON.parse(itemsInCart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(prod => prod.id === product.id);

      if (productIndex > -1) {
        // eslint-disable-next-line operator-assignment
        products[productIndex].quantity = products[productIndex].quantity + 1;
        setProducts([...products]);
      } else {
        const { id, image_url, price, title } = product;
        setProducts([
          ...products,
          { id, image_url, price, quantity: 1, title },
        ]);
      }

      await AsyncStorage.removeItem('@marketplace:products');
      await AsyncStorage.setItem(
        '@marketplace:products',
        JSON.stringify([...products]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsIncremented = products.map(product => {
        if (product.id === id) {
          const { title, image_url, price, quantity } = product;

          return { id, title, image_url, price, quantity: quantity + 1 };
        }
        return product;
      });

      setProducts(productsIncremented);
      await AsyncStorage.removeItem('@marketplace:products');
      await AsyncStorage.setItem(
        '@marketplace:products',
        JSON.stringify([...productsIncremented]),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsIncremented = products.map(product => {
        if (product.id === id && product.quantity > 0) {
          const { title, image_url, price, quantity } = product;

          return { id, title, image_url, price, quantity: quantity - 1 };
        }
        return product;
      });

      setProducts(productsIncremented);
      await AsyncStorage.removeItem('@marketplace:products');
      await AsyncStorage.setItem(
        '@marketplace:products',
        JSON.stringify([...productsIncremented]),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
