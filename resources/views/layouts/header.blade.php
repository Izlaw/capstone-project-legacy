<head>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')

    @livewireStyles
</head>

<body>
    <header class="bg-deep h-12 flex justify-between items-center max-w-full">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="auth-status" content="{{ Auth::check() ? 'authenticated' : 'guest' }}">


        <!-- 7 GUYS HOUSE OF FASHION TEXT -->
        <a href="{{ route('home') }}">
            <div class="flex flex-col justify-center ml-0">
                <div class="weblogo1 text-lg font-bold text-highlight text-center"
                    style="-webkit-text-stroke: 0.3px black;">7 GUYS</div>
                <div class="weblogo2 text-sm font-bold text-highlight text-center"
                    style="-webkit-text-stroke: 0.3px black;">HOUSE OF FASHION</div>
            </div>
        </a>

        <!-- User Info -->
        <div class="userContainer flex items-center space-x-2 mr-2 relative">
            <!-- Notification Bell -->
            @auth
            @if(auth()->user()->isAdmin() || auth()->user()->isEmployee() || auth()->user()->isCustomer())
            <div class="relative">
                <livewire:notification-bell />
            </div>
            @endif
            @endauth

            <!-- Faq section -->
            @if(!auth()->check() || !(auth()->user()->isAdmin() || auth()->user()->isEmployee()))
            <!-- Contact Us Wrapper -->
            <div class="">
                @php
                $randomEmployee = App\Models\User::where('role', 'employee')->inRandomOrder()->first();
                $conversation = App\Models\Conversation::where('user_id', Auth::id())->first();
                @endphp

                @if ($randomEmployee)
                <a href="{{ route('asksupport.create') }}" class="relative group w-full">
                    <img class="customerSupport h-8 w-8" src="{{ asset('img/customersupport.svg') }}" alt="Customer Support icon">
                </a>
                @else
                <!-- <p class="text-center text-gray-400 mt-4">No employees available at the moment.</p> -->
                @endif
            </div>
            @endif

            @auth
            <span class="userName text-white">{{ Auth::user()->fullCustomerName }}</span>
            @else
            <span class="userName text-white">Guest</span>
            @endauth
            <img class="userIcon h-8 w-8 pointer cursor-pointer" src="{{ asset('img/useraccount.svg') }}" alt="User Account icon">

            <!-- Drop down -->
            <div class="userIconDropdown hidden absolute top-2 right-0 mt-10 w-48 bg-deep text-white rounded-md shadow-lg py-2 z-1">
                @auth
                <a href="{{ route('userprofile') }}" class="block px-4 py-2 text-sm hover:bg-highlight hover:text-white transition duration-300 ease-in-out rounded-md">
                    Profile
                </a>
                @endauth

                @if (Auth::check())
                <!-- Logout form (POST request) -->
                <form id="logout-form" method="POST" action="{{ route('logout') }}">
                    @csrf
                    <a href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="block px-4 py-2 text-sm text-white hover:bg-highlight transition duration-300 ease-in-out rounded-md">
                        Logout
                    </a>
                </form>
                @else
                <!-- Login link (GET request) -->
                <a href="{{ route('login') }}" class="block px-4 py-2 text-sm hover:bg-highlight hover:text-white transition duration-300 ease-in-out rounded-md">
                    Login
                </a>
                @endif
            </div>
        </div>
    </header>

    <!-- Include Livewire Scripts (Before closing </body>) -->
    @livewireScripts

    @vite('resources/js/notification.js')
</body>