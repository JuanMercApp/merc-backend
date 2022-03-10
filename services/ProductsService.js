import fetch from 'node-fetch';

export default class ProductsService {
    static generateProductsResponse(rawProducts, breadcrumCategories) {
        const products = rawProducts.results.map((product) => {
            const simpleProduct = {
                "id": product.id,
                "title": product.title,
                "price": {
                    "currency": product.currency_id,
                    "amount": product.price,
                    "decimals": 0
                },
                "picture": product.thumbnail,
                "condition": product.condition,
                "free_shipping": product.shipping.free_shipping,
                "address": product.address.state_name
            };

            return simpleProduct;
        });

        const processedProducts = {
            "author": {
                "name": "Juan Jose",
                "lastname": "Andrade Pardo"
            },
            "categories": breadcrumCategories,
            "items": products
        };

        return processedProducts;
    }

    static generateProductResponse(rawProduct, breadcrumCategories, productDescription) {
        const product = {
            "author": {
                "name": "Juan Jose",
                "lastname": "Andrade Pardo"
            },
            "categories": breadcrumCategories,
            "item": {
                "id": rawProduct.id,
                "title": rawProduct.title,
                "price": {
                    "currency": rawProduct.currency_id,
                    "amount": rawProduct.price,
                    "decimals": 0
                },
                "picture": rawProduct.pictures[0].url,
                "condition": rawProduct.condition,
                "free_shipping": rawProduct.shipping.free_shipping,
                "sold_quantity": rawProduct.sold_quantity,
                "description": productDescription.plain_text
            }
        };

        return product;
    }


    static getMostImportantCategory(rawProducts) {
        const rawCategoryFilter = rawProducts.available_filters.find((filter) => filter.id === 'category');
        if (rawCategoryFilter == null) {
            return null;
        }

        const rawCategories = rawCategoryFilter.values;
        let mostImportantCategory = {results: 0};
        rawCategories.forEach((category) => {
            if (category.results > mostImportantCategory.results) {
                mostImportantCategory = category;
            }
        });
        return mostImportantCategory;
    }

    static getBreadCrumFromRawProducts(rawProducts) {
        const rawCategoryFilter = rawProducts.filters.find((filter) => filter.id === 'category');
        if (rawCategoryFilter == null || rawCategoryFilter.values[0] == null || rawCategoryFilter.values[0].path_from_root == null ) {
            return [];
        }

        const breadcrumCategories = rawCategoryFilter.values[0].path_from_root.map((category) => category.name);
        return breadcrumCategories;
    }

    static async getCategoryClasification(categoryId) {
        const breadcrumCategoriesFetch = await fetch(`https://api.mercadolibre.com/categories/${categoryId}`);
        const breadcrumRawCategories = await breadcrumCategoriesFetch.json();
        const breadcrumCategories = breadcrumRawCategories.path_from_root.map((category) => category.name);
        return breadcrumCategories;
    }

    static async getProcessedProducts(productQuery) {
        const rawProductsFetch = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=:${productQuery}`);
        const rawProducts = await rawProductsFetch.json();
        const mostImportantCategory = this.getMostImportantCategory(rawProducts);
        let breadcrumCategories = [];
        if (mostImportantCategory != null) {
            breadcrumCategories = await this.getCategoryClasification(mostImportantCategory.id);
        } else {
            breadcrumCategories = this.getBreadCrumFromRawProducts(rawProducts);
        }

        return this.generateProductsResponse(rawProducts, breadcrumCategories);
    };

    static async getProcessedProduct(productId) {
        const rawProductFetch = await fetch(`https://api.mercadolibre.com/items/${productId}`);
        const rawProductDescriptionFetch = await fetch(`https://api.mercadolibre.com/items/${productId}/description`);
        const rawProduct = await rawProductFetch.json();
        const productDescription = await rawProductDescriptionFetch.json();
        const breadcrumCategories = await this.getCategoryClasification(rawProduct.category_id);
        
        return this.generateProductResponse(rawProduct, breadcrumCategories, productDescription);
    }
};