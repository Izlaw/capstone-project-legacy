@props(['route'])

@php

@endphp

<a href="{{ route($route) }}" class="group flex items-center text-white transition-all duration-300 ease-in-out">
    <!-- Back Arrow Icon -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform animate-pulse group-hover:scale-110 group-hover:rotate-6 group-hover:translate-x-3 transition-all duration-300 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
</a>