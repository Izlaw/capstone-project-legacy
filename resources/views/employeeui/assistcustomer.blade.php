<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Assistance</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @livewireStyles
    @include('layouts.header')
</head>

<body class="bg-secondary font-sans">
    <!-- Back Button -->
    <x-backbutton route="home" />

    <!-- Main Title -->
    <div class="text-center py-6">
        <h1 class="text-3xl font-semibold text-white">Customer Assistance</h1>
    </div>

    <!-- Conversation List -->
    <div class="container mx-auto px-4 py-6 text-white">
        @livewire('conversation-list')
    </div>

    @livewireScripts
</body>

</html>