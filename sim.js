const memoryBlocks = [];
const processes = [];
let pointer = 0;

function addBlock() {
    const size = parseInt(
        document.getElementById("block-size").value,
        10
    );
    if (isNaN(size) || size <= 0) {
        alert("Please enter a valid block size.");
        return;
    }

    const block = {
        id: memoryBlocks.length + 1,
        size: size,
        freeSize: size,
        processes: [],
    };

    memoryBlocks.push(block);
    renderBlocks();
    document.getElementById("block-size").value = "";
}

function addProcess() {
    const size = parseInt(
        document.getElementById("process-size").value,
        10
    );
    if (isNaN(size) || size <= 0) {
        alert("Please enter a valid process size.");
        return;
    }

    const process = { id: processes.length + 1, size };
    processes.push(process);

    const jobQueueList = document.getElementById("job-queue-list");
    const jobItem = document.createElement("li");
    jobItem.textContent = `Process ${process.id}: ${process.size} KB`;
    jobQueueList.appendChild(jobItem);

    const log = document.getElementById("log");
    log.innerHTML += `<p>Process ${process.id} of size ${process.size} KB added to job queue.</p>`;

    document.getElementById("process-size").value = "";
}

function renderBlocks() {
    const container = document.getElementById("memory-blocks");
    container.innerHTML = "";
    memoryBlocks.forEach((block) => {
        const blockElement = document.createElement("div");
        blockElement.classList.add("block");
        blockElement.id = `block-${block.id}`;

        if (block.id == pointer) {
            blockElement.classList.add("highlight");
            console.log(`pointer is in mem block: ${pointer}`);
        } else {
            blockElement.classList.remove("highlight");
        }

        const header = document.createElement("div");
        header.classList.add("block-header");
        header.textContent = `Block ${block.id}: ${block.size} KB`;

        const content = document.createElement("div");
        content.classList.add("block-content");

        let usedSize = 0;
        block.processes.forEach((process) => {
            const processElement = document.createElement("div");
            processElement.classList.add(
                "process-section",
                "allocated-section"
            );
            const width = (process.size / block.size) * 100;
            processElement.style.width = `${width}%`;
            processElement.textContent = `P${process.id}: ${process.size} KB`;
            usedSize += process.size;
            content.appendChild(processElement);
        });

        const freeSize = block.size - usedSize;
        if (freeSize > 0) {
            const freeElement = document.createElement("div");
            freeElement.classList.add(
                "process-section",
                "free-section"
            );
            const width = (freeSize / block.size) * 100;
            freeElement.style.width = `${width}%`;
            freeElement.textContent = `Free: ${freeSize} KB`;
            content.appendChild(freeElement);
        }

        blockElement.appendChild(header);
        blockElement.appendChild(content);
        container.appendChild(blockElement);
    });
}

async function runSimulation() {
    const log = document.getElementById("log");
    log.innerHTML += "<p>Starting simulation...</p>";

    for (const process of processes) {
        let allocated = false;

        const jobQueueList =
            document.getElementById("job-queue-list");
        const jobItems = jobQueueList.getElementsByTagName("li");

        let jobItem;
        for (let i = 0; i < jobItems.length; i++) {
            if (
                jobItems[i].textContent.includes(
                    `Process ${process.id}:`
                )
            ) {
                jobItem = jobItems[i];
                break;
            }
        }

        if (!jobItem) {
            log.innerHTML += `<p>Process ${process.id} not found in the job queue.</p>`;
            continue;
        }

        jobItem.classList.add("highlight");
        log.innerHTML += `<p>Checking Process ${process.id} of size ${process.size} KB...</p>`;

        let blockChecked = false;

        for (let i = 0; i < memoryBlocks.length; i++) {
            const currentIndex =
                (pointer + i) % memoryBlocks.length;
            const block = memoryBlocks[currentIndex];
            const blockElement = document.getElementById(
                `block-${block.id}`
            );

            blockElement.classList.add("highlight");
            log.innerHTML += `<p>Checking Block ${block.id} for Process ${process.id} of size ${process.size} KB...</p>`;
            await delay(1000);

            if (block.freeSize >= process.size) {
                block.processes.push(process);
                block.freeSize -= process.size;

                pointer = (currentIndex + 1) % memoryBlocks.length;
                renderBlocks();
                console.log(`pointer is in mem block: ${pointer}`);
                if (pointer == 0) {
                    document
                        .getElementById(`block-${pointer + 1}`)
                        .classList.remove("highlight");
                } else {
                    document
                        .getElementById(`block-${pointer}`)
                        .classList.remove("highlight");
                }

                log.innerHTML += `<p>Process ${process.id} of size ${process.size} KB allocated to Block ${block.id}.</p>`;

                allocated = true;

                jobItem.classList.remove("highlight");
                jobItem.classList.add("allocated");
                jobItem.textContent = `Process ${process.id}: ${process.size} KB (Allocated to Block ${block.id})`;

                break;
            }

            blockElement.classList.remove("highlight");
        }

        if (!allocated) {
            log.innerHTML += `<p>Process ${process.id} of size ${process.size} KB could not be allocated.</p>`;
            jobItem.classList.remove("highlight");
            jobItem.classList.add("unallocated");
            jobItem.textContent = `Process ${process.id}: ${process.size} KB (Unallocated)`;
        }

        jobItem.classList.remove("highlight");
    }

    log.innerHTML += "<p>Simulation complete.</p>";
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
