@vite('resources/css/app.css')
@vite('resources/js/app.js')
@include('layouts.header')

<body class="bg-secondary">
    <div class="EditContainer bg-primary">
        <x-backbutton route="home" />
        @include('profile.partials.update-profile-information-form')
    </div>
</body>