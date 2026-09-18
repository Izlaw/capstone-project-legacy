<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('1. Registration attempt', $request->all());

        // Get age from birthday
        $birthdate = Carbon::parse($request->bday);
        $age = $birthdate->diffInYears(Carbon::now());
        Log::info('User age: ' . $age);

        // Check age requirement first
        if ($age < 18) {
            Log::info('3. Validation failed: User is under 18');
            return redirect()->back()
                ->withInput()
                ->withErrors(['bday' => 'You must be 18 years old or above!']);
        }

        // Validation
        Log::info('2. Starting validation');
        $validator = validator($request->all(), [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:' . User::class],
            'password' => [
                'required',
                'confirmed',
                'max:16', // Add max length rule here
                Rules\Password::min(8) // Minimum 8 characters
                    ->mixedCase() // Must contain uppercase and lowercase letters
                    ->numbers()   // Must contain numbers
                    ->symbols()   // Must contain special characters (@$!%*?&)
            ],
            'sex' => ['required', 'string', 'in:male,female,other'],
            'bday' => [
                'required',
                'date_format:Y-m-d',
            ],
            'contact' => ['required', 'string', 'max:13'],
            'address' => ['required', 'string', 'max:255'],
        ], [
            // Custom messages for password validation
            'password.required' => 'The password field is required.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.max' => 'Password must not exceed 16 characters.',
            'password.mixedCase' => 'Password must contain at least one uppercase and one lowercase letter.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one special character (@$!%*?&).',
        ]);

        if ($validator->fails()) {
            Log::info('3. Validation failed: ', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        Log::info('3. Validation successful');

        // Create a new user and save
        Log::info('4. Creating user');
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer', // Assuming 'customer' as default role
            'sex' => $request->sex,
            'bday' => $request->bday,
            'contact' => $request->contact,
            'address' => $request->address,
        ]);

        Log::info('5. User created successfully', ['user' => $user]);

        event(new Registered($user));

        // Remove to automatically log the user in after register
        // Auth::login($user);

        return redirect()->route('login');
    }
}
