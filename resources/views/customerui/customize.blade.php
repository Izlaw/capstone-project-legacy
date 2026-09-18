<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customize T-shirt</title>
    @vite('resources/css/app.css')
    @vite('resources/js/app.js')
    @include('layouts.header')
</head>

<body class="font-sans antialiased flex flex-col min-h-screen overflow-hidden">
    <div class="flex-grow flex">
        <!-- Page Content -->
        <main class="flex-grow flex flex-col items-center">
            <div id="tshirt-container" class="w-full h-96">
                <!-- T-shirt model will render here -->
            </div>
        </main>

        <!-- Order Summary Panel - Add this where it makes sense in your page layout -->
        <div id="orderSummaryPanel" class="fixed top-24 right-4 w-80 bg-deep text-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-primary py-2 px-4 flex justify-between items-center">
                <h3 class="font-bold mx-auto">Order Details</h3>
            </div>
            <div id="summaryContent" class="p-4 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-600">
                            <th class="text-left pb-2">Item</th>
                            <th class="text-left pb-2">Details</th>
                            <th class="text-right pb-2">Price</th>
                            <th class="text-center pb-2">Qty</th>
                            <th class="text-right pb-2">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody id="sizesContainer">
                        <!-- Size rows will be dynamically inserted here -->
                    </tbody>
                    <tbody>
                        <tr class="border-b border-gray-700">
                            <td class="py-2">Fabric</td>
                            <td class="py-2">
                                <p id="summaryFabric">None selected</p>
                            </td>
                            <td class="text-right py-2"></td>
                            <td class="text-center py-2"></td>
                            <td class="text-right py-2"></td>
                        </tr>
                        <tr class="font-bold">
                            <td class="text-right pt-3" colspan="4">Total:</td>
                            <td class="text-right pt-3"><span id="summaryTotal">₱0.00</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <footer class="Footer px-2 bg-primary flex justify-between items-center">
        <!-- Go Back button -->
        <x-backbutton route="addorder" />
        <!-- Center container for design tools -->
        <div class="designContainer flex items-center justify-center flex-grow rounded-lg ">

            <!-- Reset functions -->
            <div class="flex flex-col items-center bg-deep rounded-lg p-2 mx-2">
                <!-- Reset camera -->
                <!-- <span class="text-white font-semibold text-sm tracking-wider mb-2">Reset Camera</span> -->
                <button id="resetCamera" class="relative p-4 rounded-full bg-accent text-white transition-all duration-300 ease-in-out hover:bg-red-500 focus:outline-none hover:shadow-xl">
                    <span class="relative flex items-center justify-center w-16 h-16">
                        <img src="img/reset-icon.svg" class="absolute h-16 w-16 transition-transform duration-300 ease-in-out hover:rotate-[-360deg]" alt="reset camera">
                        <i class="bi bi-camera text-3xl"></i>
                    </span>
                </button>

                <!-- Reset Design Button -->
                <div class="flex flex-col items-center bg-deep rounded-lg py-2">
                    <!-- <span class="text-white font-semibold text-sm tracking-wider mb-2">Reset Design</span> -->
                    <button id="resetDesign" class="relative p-4 rounded-full bg-accent text-white transition-all duration-300 ease-in-out hover:bg-red-500 focus:outline-none hover:shadow-xl">
                        <span class="relative flex items-center justify-center w-16 h-16">
                            <img src="img/reset-icon.svg" class="absolute h-16 w-16 transition-transform duration-300 ease-in-out hover:rotate-[-360deg] transform" alt="reset design">
                            <i class="fa-solid fa-shirt text-3xl"></i>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Spin model -->
            <!-- <div class="mx-2 flex flex-col items-center bg-deep rounded-lg p-2">
                <span class="text-white font-semibold text-sm tracking-wider mb-2">Toggle Spin</span>
                <button id="toggleSpin" class="p-4 rounded-full bg-red-500 text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:scale-110 focus:outline-none shadow-lg hover:shadow-xl">
                    <span class="relative inline-block">
                        <img src="img/spin-icon.svg" class="h-10 w-10 transition-all duration-300 ease-in-out transform" alt="toggle spin">
                    </span>
                </button>
            </div> -->

            <!-- Toggle Buttons -->
            <div class="mx-2 grid grid-cols-2 gap-2 bg-deep rounded-lg p-2">
                <!-- <span class="col-span-2 text-white font-semibold text-sm tracking-wider mb-2">Toggle Parts</span> -->
                <button id="toggleFront" class="p-2 rounded bg-accent text-white">Front</button>
                <button id="toggleSleeves" class="p-2 rounded bg-accent text-white">Sleeves</button>
                <button id="toggleBack" class="p-2 rounded bg-accent text-white">Back</button>
                <button id="toggleCollar" class="p-2 rounded bg-accent text-white">Collar</button>
                <button id="toggleAll" class="p-2 rounded bg-accent text-white">Toggle All</button>
            </div>

            <!-- Pick color -->
            <div id="colorPickerContainer" class="mx-2 rounded-lg bg-deep p-4  hover:shadow-2xl hover:bg-highlight transition-all duration-300 ease-in-out">
                <div id="colorPicker"></div>
            </div>

            <!-- Size and Fabric Selection -->
            <div class="flex items-center justify-center bg-deep mx-2 text-white p-4 rounded-lg transition-transform transform hover:scale-105 duration-300">
                <form id="sizeForm" method="POST" action="{{ route('qrcode') }}">
                    @csrf
                    <input type="hidden" name="model" value="tshirt">
                    <input type="hidden" name="text" id="textDataInput" value="">

                    <!-- <p class="text-center mb-2">Select Sizes</p> -->
                    <div id="sizeInputsContainer">
                        <button type="button" id="openSizeModalButton" class="bg-accent text-white p-4 rounded hover:bg-highlight transition"><i class="fas fa-ruler-vertical fa-2xl"></i></button>
                    </div>
                </form>
                <!-- <div id="hoverWindow" class="fixed bg-secondary text-white px-4 py-2 rounded-lg hidden -mt-28">
                    <h3 class="text-base font-semibold mt-2">Please select a size</h3>
                    <ul id="selectedSizesList"></ul>
                </div> -->

                <!-- Fabric Container -->
                <div class="block FabricContainer mr-2 bg-deep p-2 rounded-lg">
                    <!-- Fabric Type Input Field -->
                    <label for="fabric_type" class="block text-sm font-medium text-white"><i class="fas fa-cut"></i></label>
                    <select id="fabric_type" name="fabric_type" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-primary text-white">
                        <!-- <option value="" disabled selected class="text-gray-500">Select fabric type</option> -->
                    </select>
                    <input type="text" id="custom_fabric_type" name="custom_fabric_type" placeholder="Enter custom fabric type" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-primary text-white {{ old('fabric_type', $customOrder->fabric_type ?? '') == 'custom' ? '' : 'hidden' }}" value="{{ old('custom_fabric_type', $customOrder->custom_fabric_type ?? '') }}">
                </div>
            </div>
            <!-- Text Customization Button -->
            <div class="mx-2 bg-deep p-2 rounded-lg">
                <button id="openTextModalButton" class="bg-accent text-white py-2 px-4 rounded hover:bg-highlight transition">Text<br><i class="fas fa-font fa-2xl"></i></button>
            </div>
            <div class="flex flex-col items-center bg-deep text-center p-4 rounded-lg mx-2 text-white hover:border-highlight transition-all duration-300 ease-in-out">
                <div>
                    <p class="font-medium text-highlight">Total Amount</p>
                    <p id="totalAmount" class="text-2xl font-semibold text-white">₱0.00</p>
                </div>
                <div>
                    <button id="showPricingButton" class="bg-deep text-white p-3 rounded-lg hover:scale-125 transition">
                        <i class="bi bi-tags-fill text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        <!-- Confirm order -->
        <button id="confirmOrder" class="ml-auto text-white p-3 rounded-lg border-2 border-transparent bg-deep hover:bg-white hover:text-deep hover:border-deep transition-all duration-300 ease-in-out transform shadow-md hover:shadow-lg">
            Confirm Order
        </button>
    </footer>

    <!-- Text Customization Modal -->
    <div id="textModal" class="hidden">
        <div class="modal-content">
            <span id="modalCloseButton" class="modal-close">&times;</span>
            <h2>Customize Text</h2>
            <label for="modalInputText">Enter your text:</label>
            <input type="text" id="modalInputText" placeholder="Your text here">
            <label for="fontSizeSlider">Font Size:</label>
            <input type="range" id="fontSizeSlider" min="10" max="100" value="64">
            <label for="colorPickerInput">Text Color:</label>
            <input type="color" id="colorPickerInput" value="#ff0000">
            <div id="modalPreviewContainer">
                <div id="modalPreviewText">Your Text Here</div>
            </div>
            <div class="flex justify-end">
                <button id="modalCancelButton" class="bg-gray-500 text-white px-4 py-2 mr-2 rounded">Cancel</button>
                <button id="modalApplyButton" class="bg-accent text-white px-4 py-2 rounded">Apply Text</button>
            </div>
        </div>
    </div>
    @vite('resources/js/customize.js')
</body>

</html>