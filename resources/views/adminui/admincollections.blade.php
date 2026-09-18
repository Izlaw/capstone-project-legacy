<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Existing Designs</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @vite('resources/js/managecollection.js')
    @vite('resources/js/swalpopup.js')
    @include('layouts.header')
</head>

<body class="bg-secondary bg-cover">

    <!-- Go back button -->
    <x-backbutton route="home" />

    @livewire('manage-collections')

</body>

</html>