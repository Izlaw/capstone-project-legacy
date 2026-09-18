<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Prices</title>
    @vite([
    'resources/js/app.js',
    'resources/js/managesizes.js',
    'resources/css/app.css',
    'resources/js/managetimeframe.js',
    'resources/js/managefabrics.js',
    ])
    @include('layouts.header')
</head>

<body class="bg-secondary">
    <x-backbutton route="home" />

    <div class="mx-auto p-5" x-data="{
        priceTypes: ['sizes', 'timeframe', 'fabric'],
        currentTypeIndex: 0,
        get currentType() {
            return this.priceTypes[this.currentTypeIndex];
        },
        cycleLeft() {
            this.currentTypeIndex = (this.currentTypeIndex - 1 + this.priceTypes.length) % this.priceTypes.length;
        },
        cycleRight() {
            this.currentTypeIndex = (this.currentTypeIndex + 1) % this.priceTypes.length;
        }
    }">
        <div class="flex justify-between items-center mb-4 bg-secondary rounded">
            <button class="text-white px-2 hover:bg-highlight rounded transition" @click="cycleLeft()">
                <i class="bi bi-arrow-left-circle fa-2x"></i>
            </button>
            <span class="bg-secondary text-white px-4 py-2 rounded text-2xl" x-text="currentType.charAt(0).toUpperCase() + currentType.slice(1)"></span>
            <button class="text-white px-2 hover:bg-highlight rounded transition" @click="cycleRight()">
                <i class="bi bi-arrow-right-circle fa-2x"></i>
            </button>
        </div>
        <div x-show="currentType === 'sizes'">
            @livewire('manage-sizes')
        </div>
        <div x-show="currentType === 'timeframe'">
            @livewire('manage-timeframe')
        </div>
        <div x-show="currentType === 'fabric'">
            @livewire('manage-fabric')
        </div>
    </div>


</body>

</html>