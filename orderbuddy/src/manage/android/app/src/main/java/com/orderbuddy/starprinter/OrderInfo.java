package com.orderbuddy.starprinter;


import java.util.List;

public class OrderInfo {
    public String _id;
    public String orderCode;
    public String paymentId;
    public String restaurantId;
    public String locationId;
    public String locationSlug;
    public Meta meta;
    public Customer customer;
    public Origin origin;
    public List<Item> items;
    public String status;
    public String startedAt;
    public int totalPriceCents;
    public boolean getSms;
    public String endedAt;

    public static class Meta {
        public String correlationId;
    }

    public static class Customer {
        public String name;
        public String phone;
    }

    public static class Origin {
        public String id;
        public String name;
    }

    public static class Item {
        public String id;
        public String menuItemId;
        public String name;
        public int priceCents;
        public String notes;
        public List<Modifier> modifiers;
        public List<Variant> variants;
        public List<String> stationTags;
        public String startedAt;
        public String completedAt;
    }

    public static class Modifier {
        public String id;
        public String name;
        public List<Option> options;
    }

    public static class Option {
        public String name;
        public int priceCents;
    }

    public static class Variant {
        public String id;
        public String name;
        public int priceCents;
    }
}

