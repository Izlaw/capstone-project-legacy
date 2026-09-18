<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @include('layouts.header')
</head>

<body class="bg-secondary">
    <x-backbutton route="home" />
    <div class="container mx-auto mt-8">
        <div class="profile-card bg-white rounded-lg overflow-hidden shadow-md max-w-2xl mx-auto h-[20rem] flex items-center">
            <div class="profile-content flex items-center w-full">
                <div class="profile-image w-1/3 p-4 flex justify-center items-center">
                    <div class="rounded-full bg-gray-200 flex items-center justify-center w-32 h-32">
                        <i class="bi bi-person-circle text-6xl text-secondary"></i>
                    </div>
                </div>
                <div class="profile-info w-2/3 p-4 text-secondary">
                    <h2 class="text-xl font-semibold mb-4">User Information</h2>
                    <div class="mb-4"><strong>Name:</strong> <span class="ml-2">{{ Auth::user()->fullCustomerName }}</span></div>
                    <div class="mb-4"><strong>Email:</strong> <span class=" ml-2">{{ Auth::user()->email }}</span></div>
                    <div class="mb-4"><strong>Phone:</strong> <span class="ml-2">{{ Auth::user()->contact }}</span></div>
                    <div class="mb-4"><strong>Address:</strong> <span class="ml-2">{{ Auth::user()->address }}</span></div>
                </div>
            </div>
        </div>
    </div>

</body>

</html>