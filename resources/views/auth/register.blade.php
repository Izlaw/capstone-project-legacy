<title>Register Page</title>
@vite('resources/css/app.css')
@vite('resources/js/app.js')
@include('layouts.header')

<body class="bg-secondary bg-cover overflow-y-hidden">

    <div class="RegisterFormContainer flex items-center justify-center h-screen">
        <form method="POST" action="{{ route('register') }}" class="mx-auto bg-secondary w-2/3 bg-opacity-80 backdrop-blur-md h-4/5 scroll-smooth snap-start snap-always rounded-md shadow-xl">
            <p class="RegisterTxt translate-y-6 text-center text-4xl font-semibold text-highlight">Register</p>
            <p class="RegisterTxt translate-y-6 text-center text-lg font-medium text-white mb-10">Create an account with 7 GUYS House of Fashion to start customizing!</p>
            @csrf

            <div class="RegisterFormContainer overflow-y-scroll h-65percent space-y-6 px-4">
                <!-- First Name and Last Name -->
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label for="first_name" class="block p-2 font-medium rounded text-highlight">First Name</label>
                        <x-text-input id="first_name" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="text" placeholder="First Name" name="first_name" :value="old('first_name')" required autofocus autocomplete="given-name" />
                        <div id="first-name-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                    <div class="w-1/2">
                        <label for="last_name" class="block p-2 font-medium rounded text-highlight">Last Name</label>
                        <x-text-input id="last_name" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="text" placeholder="Last Name" name="last_name" :value="old('last_name')" required autocomplete="family-name" />
                        <div id="last-name-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                </div>

                <!-- Email Address and Contact Number -->
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label for="email" class="block p-2 font-medium rounded text-highlight">Email Address</label>
                        <x-text-input id="email" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="email" placeholder="Email" name="email" :value="old('email')" required autocomplete="username" />
                        <div id="email-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                    <div class="w-1/2">
                        <label for="contact" class="block p-2 font-medium rounded text-highlight">Contact Number</label>
                        <x-text-input id="contact" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="tel" placeholder="Contact Number" name="contact" :value="old('contact')" required maxlength="13" />
                        <div id="contact-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                </div>

                <!-- Password and Confirm Password -->
                <div class="flex gap-4">
                    <div class="w-1/2 relative">
                        <label for="passwordRegister" class="block p-2 font-medium rounded text-highlight">Password</label>
                        <div class="relative">
                            <x-text-input id="passwordRegister" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight pr-10" type="password" placeholder="Password" name="password" required autocomplete="new-password" />
                            <button type="button" id="togglePasswordRegister" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hidden">
                                <!-- Eye off icon: visible when password is hidden -->
                                <svg id="eyeOffIconRegister" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0110 19c-5 0-9-4-9-9 0-1.73.575-3.33 1.537-4.637M16.12 16.12A4.5 4.5 0 019.88 9.88m6.24 6.24L3 3" />
                                </svg>
                                <!-- Eye icon: hidden initially -->
                                <svg id="eyeIconRegister" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 hidden" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-5-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                                    <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                            </button>
                        </div>
                        <div id="password-error" class="mt-2 text-red-500 text-sm" style="display: none;"></div>
                        @error('password')
                        <p class="mt-2 text-red-500 text-sm">{{ $message }}</p>
                        @enderror
                    </div>
                    <div class="w-1/2 relative">
                        <label for="password_confirmation" class="block p-2 font-medium rounded text-highlight">Confirm Password</label>
                        <div class="relative">
                            <x-text-input id="password_confirmation" class="block w-full p-2 pr-10 font-medium rounded focus:ring-highlight focus:border-highlight" type="password" name="password_confirmation" required autocomplete="new-password" placeholder="Confirm Password" />
                            <button type="button" id="togglePasswordRegisterConfirm" class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hidden">
                                <!-- Eye off icon -->
                                <svg id="eyeOffIconConfirmRegister" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0110 19c-5 0-9-4-9-9 0-1.73.575-3.33 1.537-4.637M16.12 16.12A4.5 4.5 0 019.88 9.88m6.24 6.24L3 3" />
                                </svg>
                                <!-- Eye icon (initially hidden) -->
                                <svg id="eyeIconConfirmRegister" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 hidden" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-5-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                                    <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                            </button>
                        </div>
                        <div id="password-confirmation-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                </div>

                <!-- Birthday and Sex -->
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label for="bday" class="block text-center text-sm font-medium text-highlight">Birthday</label>
                        <x-text-input id="bday" class="block mx-auto w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="text" placeholder="Select Birthday" name="bday" :value="old('bday')" required readonly />
                        <div id="bday-error" class="mt-2 text-red-500" style="display: none;"></div>
                        <!-- <p class="text-xs text-center text-highlight mt-1">Must be 18 years or older</p> -->
                    </div>
                    <div class="w-1/2">
                        <label for="sex" class="block text-center text-sm font-medium text-highlight">Sex</label>
                        <select id="sex" class="block mx-auto w-full mt-1 p-2 font-medium rounded focus:ring-highlight focus:border-highlight" name="sex" required value="old('sex')">
                            <option value="">Select Sex</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <div id="sex-error" class="mt-2 text-red-500" style="display: none;"></div>
                    </div>
                </div>

                <!-- Address (full width) -->
                <div>
                    <label for="address" class="block p-2 font-medium rounded text-highlight">Address</label>
                    <x-text-input id="address" class="block w-full p-2 font-medium rounded focus:ring-highlight focus:border-highlight" type="text" placeholder="Address" name="address" :value="old('address')" required />
                    <div id="address-error" class="mt-2 text-red-500" style="display: none;"></div>
                </div>
            </div>

            <!-- Buttons wrapper - side by side -->
            <div class="flex justify-center items-center space-x-4 mt-6">
                <!-- Register button -->
                <button class="font-semibold text-highlight bg-deep hover:text-white hover:bg-accent transform transition duration-300 ease-in-out px-4 py-2 rounded-md shadow-lg focus:outline-none">
                    {{ __('Register') }}
                </button>

                <!-- Login redirect -->
                <button type="button" class="font-semibold text-highlight bg-deep hover:text-white hover:bg-accent transform transition duration-300 ease-in-out px-4 py-2 rounded-md shadow-lg focus:outline-none" onclick="window.location.href='{{ route('login') }}';">
                    {{ __('Already registered?') }}
                </button>
            </div>
        </form>
    </div>
</body>